import { describe, it, expect } from 'vitest';
import { allMeta } from '../allMeta';
import type { ERCEntry } from '../types';

async function loadEntry(slug: string, entryType: string): Promise<ERCEntry> {
  const subdir = entryType === 'standard' ? 'standards' : 'protocols';
  const mod = await import(`../${subdir}/${slug}.ts`);
  return mod.entry;
}

describe('Flow Diagrams', () => {
  describe.each(allMeta.map((m) => [m.slug, m.entryType]))(
    '%s',
    (slug, entryType) => {
      it('every node has a non-empty label', async () => {
        const entry = await loadEntry(slug, entryType);
        for (const node of entry.flowNodes) {
          expect(node.label, `Node ${node.id} has empty label`).toBeTruthy();
        }
      });

      it('every edge with a label has a non-empty label', async () => {
        const entry = await loadEntry(slug, entryType);
        for (const edge of entry.flowEdges) {
          if (edge.label !== undefined) {
            expect(edge.label, `Edge ${edge.id} has empty label`).toBeTruthy();
          }
        }
      });

      it('edge IDs are unique', async () => {
        const entry = await loadEntry(slug, entryType);
        if (entry.flowEdges.length === 0) return;
        const ids = entry.flowEdges.map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('simulation steps reference valid node and edge IDs', async () => {
        const entry = await loadEntry(slug, entryType);
        const nodeIds = new Set(entry.flowNodes.map((n) => n.id));
        const edgeIds = new Set(entry.flowEdges.map((e) => e.id));

        for (const sim of entry.simulations) {
          for (const step of sim.steps) {
            for (const nid of step.highlightNodes) {
              expect(
                nodeIds.has(nid),
                `Sim "${sim.id}" step "${step.id}" references unknown node "${nid}"`,
              ).toBe(true);
            }
            for (const eid of step.highlightEdges) {
              expect(
                edgeIds.has(eid),
                `Sim "${sim.id}" step "${step.id}" references unknown edge "${eid}"`,
              ).toBe(true);
            }
          }
        }
      });
    },
  );
});
