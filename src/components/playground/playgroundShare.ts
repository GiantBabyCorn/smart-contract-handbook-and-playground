import type { FlowEdgeDef } from '@/data/types';
import {
  isCustomEdge,
  type SharedPlaygroundState,
  type XY,
} from '@/stores/usePlaygroundStore';

/**
 * `?state=` share-URL codec for the playground canvas.
 *
 * Wire format: JSON → gzip (native CompressionStream) → base64url.
 * Only the minimal reproducible state travels: entry slugs, cluster anchors,
 * per-node drag positions and user-drawn edges. Entry nodes/edges/functions
 * are re-derived from the entry modules at restore time, which keeps the URL
 * short (a few hundred characters for a typical canvas).
 */

export const SHARE_STATE_VERSION = 2;

// Safety caps so a hostile/corrupt param cannot balloon memory.
const MAX_PARAM_LENGTH = 20_000;
const MAX_JSON_LENGTH = 200_000;
const MAX_SLUGS = 40;
const MAX_EDGES = 200;
const MAX_POSITIONS = 2_000;

const SLUG_RE = /^[a-z0-9-]+$/;

/** Snapshot the store state into the minimal shareable payload. */
export function buildSharedState(state: {
  addedSlugs: string[];
  anchors: Record<string, XY>;
  nodePositions: Record<string, XY>;
  edges: FlowEdgeDef[];
}): SharedPlaygroundState {
  return {
    v: SHARE_STATE_VERSION,
    slugs: [...state.addedSlugs],
    anchors: { ...state.anchors },
    positions: { ...state.nodePositions },
    edges: state.edges.filter(isCustomEdge).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      label: typeof e.label === 'string' ? e.label : '',
    })),
  };
}

// ─── base64url helpers ───────────────────────────────────────────────────────

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(param: string): Uint8Array {
  const b64 = param.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ─── gzip codec ──────────────────────────────────────────────────────────────

async function gzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(data: Uint8Array): Promise<string> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

/** Serialize a share payload into a URL-safe `?state=` parameter value. */
export async function encodeShareParam(
  state: SharedPlaygroundState,
): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(state));
  return bytesToBase64Url(await gzip(json));
}

/**
 * Parse and validate a `?state=` parameter value.
 * Throws on anything oversized, malformed or of an unknown version —
 * callers fall back to an empty canvas.
 */
export async function decodeShareParam(
  param: string,
): Promise<SharedPlaygroundState> {
  if (!param || param.length > MAX_PARAM_LENGTH) {
    throw new Error('share state param is empty or too large');
  }
  const json = await gunzip(base64UrlToBytes(param));
  if (json.length > MAX_JSON_LENGTH) {
    throw new Error('share state payload too large');
  }
  return validateSharedState(JSON.parse(json));
}

// ─── validation ──────────────────────────────────────────────────────────────

function isFiniteXY(value: unknown): value is XY {
  return (
    typeof value === 'object' &&
    value !== null &&
    Number.isFinite((value as XY).x) &&
    Number.isFinite((value as XY).y)
  );
}

function validateSharedState(raw: unknown): SharedPlaygroundState {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('share state is not an object');
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.v !== 'number' || obj.v > SHARE_STATE_VERSION) {
    throw new Error(`unsupported share state version: ${String(obj.v)}`);
  }
  if (!Array.isArray(obj.slugs) || obj.slugs.length > MAX_SLUGS) {
    throw new Error('share state slugs invalid');
  }
  const slugs = obj.slugs.filter(
    (s): s is string => typeof s === 'string' && SLUG_RE.test(s),
  );

  const anchors: Record<string, XY> = {};
  if (typeof obj.anchors === 'object' && obj.anchors !== null) {
    for (const [slug, xy] of Object.entries(obj.anchors)) {
      if (SLUG_RE.test(slug) && isFiniteXY(xy)) {
        anchors[slug] = { x: xy.x, y: xy.y };
      }
    }
  }

  const positions: Record<string, XY> = {};
  if (typeof obj.positions === 'object' && obj.positions !== null) {
    for (const [id, xy] of Object.entries(obj.positions).slice(0, MAX_POSITIONS)) {
      if (isFiniteXY(xy)) positions[id] = { x: xy.x, y: xy.y };
    }
  }

  const edges: FlowEdgeDef[] = [];
  if (Array.isArray(obj.edges)) {
    for (const e of obj.edges.slice(0, MAX_EDGES)) {
      if (
        typeof e === 'object' &&
        e !== null &&
        typeof (e as FlowEdgeDef).id === 'string' &&
        typeof (e as FlowEdgeDef).source === 'string' &&
        typeof (e as FlowEdgeDef).target === 'string' &&
        isCustomEdge(e as FlowEdgeDef)
      ) {
        const def = e as FlowEdgeDef;
        edges.push({
          id: def.id,
          source: def.source,
          target: def.target,
          type:
            def.type === 'labeled' || def.type === 'fundFlow'
              ? def.type
              : 'animated',
          label: typeof def.label === 'string' ? def.label : '',
        });
      }
    }
  }

  return { v: SHARE_STATE_VERSION, slugs, anchors, positions, edges };
}
