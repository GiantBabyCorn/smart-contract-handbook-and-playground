import { create } from 'zustand';
import type { SimulationScenario } from '@/data/types';

interface SimulationStore {
  // ─── State ───────────────────────────────────────────────────────────────────
  scenario: SimulationScenario | null;
  currentStepIndex: number;
  isPlaying: boolean;
  /** Playback speed multiplier — 1x = 2 s per step, 2x = 1 s, etc. */
  speed: number;
  /** User-editable simulation parameter values keyed by param id. */
  params: Record<string, string>;
  /** stepId → { label: value } map of computed / declared value changes per step. */
  stepResults: Record<string, Record<string, string>>;
  highlightedNodes: string[];
  highlightedEdges: string[];
  error: string | null;

  // ─── Actions ─────────────────────────────────────────────────────────────────
  setScenario: (scenario: SimulationScenario) => void;
  setCurrentStep: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setParam: (id: string, value: string) => void;
  setHighlights: (nodes: string[], edges: string[]) => void;
  addStepResult: (stepId: string, changes: Record<string, string>) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  // ─── Initial state ────────────────────────────────────────────────────────────
  scenario: null,
  currentStepIndex: -1,
  isPlaying: false,
  speed: 1,
  params: {},
  stepResults: {},
  highlightedNodes: [],
  highlightedEdges: [],
  error: null,

  // ─── Mutators ─────────────────────────────────────────────────────────────────

  setScenario: (scenario) => {
    // Build initial param values from the scenario's declared defaults.
    const params: Record<string, string> = {};
    for (const p of scenario.params) {
      params[p.id] = p.defaultValue;
    }
    set({
      scenario,
      params,
      currentStepIndex: -1,
      isPlaying: false,
      stepResults: {},
      highlightedNodes: [],
      highlightedEdges: [],
      error: null,
    });
  },

  setCurrentStep: (index) => set({ currentStepIndex: index }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setSpeed: (speed) => set({ speed }),

  setParam: (id, value) =>
    set((s) => ({ params: { ...s.params, [id]: value } })),

  setHighlights: (nodes, edges) =>
    set({ highlightedNodes: nodes, highlightedEdges: edges }),

  addStepResult: (stepId, changes) =>
    set((s) => ({
      stepResults: { ...s.stepResults, [stepId]: changes },
    })),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      currentStepIndex: -1,
      isPlaying: false,
      stepResults: {},
      highlightedNodes: [],
      highlightedEdges: [],
      error: null,
    }),
}));
