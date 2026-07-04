import { wrap, type Remote } from 'comlink';
import type { SimWorkerApi } from './simMath';

// Re-export the API types so existing imports keep working.
export type { SimWorkerApi, SimWorkerLike, TokenTransferOp, TokenTransferResult } from './simMath';

const worker = new Worker(
  new URL('./simulation.worker.ts', import.meta.url),
  { type: 'module' }
);

/**
 * Comlink proxy of the simulation worker — every `SimWorkerApi` method
 * returns a Promise on this side of the boundary.
 */
export const simWorker: Remote<SimWorkerApi> = wrap<SimWorkerApi>(worker);
