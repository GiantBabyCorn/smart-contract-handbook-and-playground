import type { SimulationScenario } from '@/data/types';
import type { SimWorkerApi } from './workerApi';

export interface SimulationState {
  scenario: SimulationScenario | null;
  currentStepIndex: number;
  isPlaying: boolean;
  params: Record<string, string>;
  stepResults: Record<string, Record<string, string>>;
  highlightedNodes: string[];
  highlightedEdges: string[];
  error: string | null;
}

/**
 * SimulationEngine orchestrates scenario playback and step navigation.
 *
 * It is intentionally decoupled from any React or Zustand API — all state
 * changes are communicated through the `onStateChange` callback so that the
 * engine can be unit-tested without a DOM environment.
 *
 * The class holds no public mutable state itself; it only drives the external
 * store via callbacks, keeping the simulation logic easy to reason about.
 */
export class SimulationEngine {
  private worker: SimWorkerApi | null = null;
  private playInterval: ReturnType<typeof setInterval> | null = null;
  private readonly onStateChange: (state: Partial<SimulationState>) => void;

  constructor(onStateChange: (state: Partial<SimulationState>) => void) {
    this.onStateChange = onStateChange;
  }

  /** Provide the comlink-wrapped worker proxy. Must be called before any compute methods. */
  setWorker(worker: SimWorkerApi): void {
    this.worker = worker;
  }

  /** Load a new scenario, initialise params from defaults and clear all run state. */
  loadScenario(scenario: SimulationScenario): void {
    this.stop();

    const params: Record<string, string> = {};
    for (const p of scenario.params) {
      params[p.id] = p.defaultValue;
    }

    this.onStateChange({
      scenario,
      currentStepIndex: -1,
      isPlaying: false,
      params,
      stepResults: {},
      highlightedNodes: [],
      highlightedEdges: [],
      error: null,
    });
  }

  /** Update a single simulation parameter value. */
  setParam(paramId: string, value: string): void {
    this.onStateChange({
      params: { [paramId]: value },
    } as Partial<SimulationState>);
  }

  /**
   * Advance to the next step.
   *
   * Applies highlight node/edge lists and any declared valueChanges for that
   * step.  Stops playback automatically when the last step is reached.
   */
  async stepForward(
    scenario: SimulationScenario,
    currentIndex: number,
  ): Promise<void> {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= scenario.steps.length) {
      this.stop();
      return;
    }

    const step = scenario.steps[nextIndex];

    this.onStateChange({
      currentStepIndex: nextIndex,
      highlightedNodes: step.highlightNodes,
      highlightedEdges: step.highlightEdges,
      error: null,
    });

    if (step.valueChanges && Object.keys(step.valueChanges).length > 0) {
      // Emit step results as a separate patch so the store can merge them
      // without clobbering results from previous steps.
      this.onStateChange({
        stepResults: { [step.id]: step.valueChanges },
      } as Partial<SimulationState>);
    }
  }

  /**
   * Go back one step, restoring the previous step's highlights.
   * No-ops if already at the beginning.
   */
  stepBack(scenario: SimulationScenario, currentIndex: number): void {
    if (currentIndex <= 0) return;

    const prevIndex = currentIndex - 1;
    const step = scenario.steps[prevIndex];

    this.onStateChange({
      currentStepIndex: prevIndex,
      highlightedNodes: step.highlightNodes,
      highlightedEdges: step.highlightEdges,
      error: null,
    });
  }

  /**
   * Start auto-play at the given speed multiplier (default 1x = 2 s per step).
   * Any existing interval is cleared before starting a new one.
   * Playback stops automatically once the last step is reached.
   */
  play(
    scenario: SimulationScenario,
    currentIndex: number,
    speed: number = 1,
  ): void {
    this.stop();
    this.onStateChange({ isPlaying: true });

    let idx = currentIndex;
    // Clamp minimum interval to 200 ms to avoid visual thrashing at high speeds.
    const intervalMs = Math.max(200, 2000 / speed);

    this.playInterval = setInterval(() => {
      idx++;
      if (idx >= scenario.steps.length) {
        this.stop();
        return;
      }

      const step = scenario.steps[idx];
      this.onStateChange({
        currentStepIndex: idx,
        highlightedNodes: step.highlightNodes,
        highlightedEdges: step.highlightEdges,
      });
    }, intervalMs);
  }

  /** Pause auto-play without resetting the step counter. */
  stop(): void {
    if (this.playInterval !== null) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    this.onStateChange({ isPlaying: false });
  }

  /** Reset to the start of the loaded scenario without unloading it. */
  reset(): void {
    this.stop();
    this.onStateChange({
      currentStepIndex: -1,
      stepResults: {},
      highlightedNodes: [],
      highlightedEdges: [],
      error: null,
    });
  }

  /** Release all resources. Should be called on component unmount. */
  destroy(): void {
    this.stop();
    this.worker = null;
  }

  // ─── Worker accessor ─────────────────────────────────────────────────────────

  /** Exposes the worker proxy for direct compute calls from custom hooks. */
  get workerApi(): SimWorkerApi | null {
    return this.worker;
  }
}
