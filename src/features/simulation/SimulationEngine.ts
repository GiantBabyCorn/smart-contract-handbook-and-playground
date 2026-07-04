import type { SimulationScenario } from '@/data/types';
import type { SimWorkerLike } from './simMath';
import {
  computeScenarioRun,
  foldNodeValues,
  type ComputedRun,
  type ComputedStepResult,
} from './computeRun';

export interface SimulationState {
  scenario: SimulationScenario | null;
  currentStepIndex: number;
  isPlaying: boolean;
  params: Record<string, string>;
  stepResults: Record<string, Record<string, string>>;
  /** Engine-computed revert info per step id (authored `isRevert` lives on the step itself). */
  stepMeta: Record<string, { isRevert?: boolean; revertReason?: string }>;
  /** nodeId → variable → current display value (drives storage-node badges). */
  nodeValues: Record<string, Record<string, string>>;
  /** Token-movement label of the current step (drives fundFlow edge pills). */
  flowLabel: string | null;
  highlightedNodes: string[];
  highlightedEdges: string[];
  error: string | null;
}

/** State patch emitted by the engine. `resetRun: true` asks the store to
 *  clear all run state (step index, results, highlights, node values). */
export type EnginePatch = Partial<SimulationState> & { resetRun?: boolean };

/**
 * SimulationEngine orchestrates scenario playback and step navigation.
 *
 * It is intentionally decoupled from any React or Zustand API — all state
 * changes are communicated through the `onStateChange` callback so that the
 * engine can be unit-tested without a DOM environment.
 *
 * Real computation (plan §5.1): when the active scenario declares a
 * `compute` binding, the engine runs the worker with the CURRENT user params
 * before the first executed step and replaces the authored `valueChanges`
 * with live per-step results. The computed run is cached per
 * (scenario, params) and invalidated when a param changes — a change during
 * a started run also resets the run so displayed numbers never mix inputs.
 * Authored values remain the fallback when compute is absent or fails.
 */
export class SimulationEngine {
  private worker: SimWorkerLike | null = null;
  private playInterval: ReturnType<typeof setInterval> | null = null;
  /** Monotonic token to cancel in-flight async play() bootstraps. */
  private playToken = 0;
  private computed: ComputedRun | null = null;
  private computedKey: string | null = null;
  private readonly onStateChange: (state: EnginePatch) => void;

  constructor(onStateChange: (state: EnginePatch) => void) {
    this.onStateChange = onStateChange;
  }

  /** Provide the comlink-wrapped worker proxy. Must be called before any compute methods. */
  setWorker(worker: SimWorkerLike): void {
    this.worker = worker;
  }

  /** Load a new scenario, initialise params from defaults and clear all run state. */
  loadScenario(scenario: SimulationScenario): void {
    this.stop();
    this.invalidateComputed();

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
      stepMeta: {},
      nodeValues: {},
      flowLabel: null,
      highlightedNodes: [],
      highlightedEdges: [],
      error: null,
    });
  }

  /**
   * Update a single simulation parameter value.
   *
   * Invalidate any computed run (results derive from params). If the run has
   * already started, also reset it so stale numbers are never displayed
   * against the new inputs.
   */
  setParam(paramId: string, value: string, currentStepIndex: number = -1): void {
    this.invalidateComputed();
    const patch: EnginePatch = { params: { [paramId]: value } };
    if (currentStepIndex >= 0) {
      this.stop();
      patch.resetRun = true;
    }
    this.onStateChange(patch);
  }

  /**
   * Advance to the next step.
   *
   * Runs the scenario's compute binding (if any) before the step executes,
   * then applies highlights and the effective (computed or authored)
   * valueChanges for that step.
   */
  async stepForward(
    scenario: SimulationScenario,
    currentIndex: number,
    params: Record<string, string> = {},
  ): Promise<void> {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= scenario.steps.length) {
      this.stop();
      return;
    }

    await this.ensureComputed(scenario, params);
    this.applyStep(scenario, nextIndex);
  }

  /**
   * Go back one step, restoring the previous step's highlights and refolding
   * node values so badges reflect that snapshot.
   * No-ops if already at the beginning.
   */
  stepBack(scenario: SimulationScenario, currentIndex: number): void {
    if (currentIndex <= 0) return;

    const prevIndex = currentIndex - 1;
    const step = scenario.steps[prevIndex];
    const effective = this.effectiveStep(scenario, prevIndex);

    this.onStateChange({
      currentStepIndex: prevIndex,
      highlightedNodes: step.highlightNodes,
      highlightedEdges: step.highlightEdges,
      flowLabel: effective?.flowLabel ?? null,
      nodeValues: this.foldUpTo(scenario, prevIndex),
      error: null,
    });
  }

  /**
   * Start auto-play at the given speed multiplier (1x = 2 s per step).
   *
   * The first step executes immediately (no dead initial wait) and every
   * auto-played step records its results exactly like stepForward.
   * Playback stops automatically once the last step is reached.
   */
  play(
    scenario: SimulationScenario,
    currentIndex: number,
    speed: number = 1,
    params: Record<string, string> = {},
  ): void {
    this.stop();
    const token = ++this.playToken;
    this.onStateChange({ isPlaying: true });

    void (async () => {
      await this.ensureComputed(scenario, params);
      if (token !== this.playToken) return; // cancelled (pause/reset/param change)

      let idx = currentIndex;
      const advance = (): boolean => {
        idx++;
        if (idx >= scenario.steps.length) {
          this.stop();
          return false;
        }
        this.applyStep(scenario, idx);
        if (idx >= scenario.steps.length - 1) {
          this.stop();
          return false;
        }
        return true;
      };

      if (!advance()) return;

      // Clamp minimum interval to 200 ms to avoid visual thrashing at high speeds.
      const intervalMs = Math.max(200, 2000 / speed);
      this.playInterval = setInterval(() => {
        advance();
      }, intervalMs);
    })();
  }

  /** Pause auto-play without resetting the step counter. */
  stop(): void {
    this.playToken++;
    if (this.playInterval !== null) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    this.onStateChange({ isPlaying: false });
  }

  /** Reset to the start of the loaded scenario without unloading it. */
  reset(): void {
    this.stop();
    this.onStateChange({ resetRun: true });
  }

  /** Release all resources. Should be called on component unmount. */
  destroy(): void {
    this.stop();
    this.worker = null;
    this.invalidateComputed();
  }

  // ─── Computed-run management ─────────────────────────────────────────────────

  private invalidateComputed(): void {
    this.computed = null;
    this.computedKey = null;
  }

  private runKey(scenario: SimulationScenario, params: Record<string, string>): string {
    return `${scenario.id}|${JSON.stringify(params)}`;
  }

  /** Compute (and cache) live step results for the scenario + params, if bound. */
  private async ensureComputed(
    scenario: SimulationScenario,
    params: Record<string, string>,
  ): Promise<void> {
    if (!scenario.compute || !this.worker) {
      this.invalidateComputed();
      return;
    }
    const key = this.runKey(scenario, params);
    if (this.computedKey === key && this.computed) return;

    try {
      this.computed = await computeScenarioRun(this.worker, scenario, params);
    } catch (err) {
      // Worker failure → fall back to the authored valueChanges.
      console.error('[SimulationEngine] compute failed, using authored values:', err);
      this.computed = null;
    }
    this.computedKey = key;
  }

  private effectiveStep(
    scenario: SimulationScenario,
    index: number,
  ): ComputedStepResult | null {
    const step = scenario.steps[index];
    if (!step) return null;
    const computed = this.computed?.steps[step.id];
    if (computed) return computed;
    return {
      changes: step.valueChanges ?? {},
      isRevert: step.isRevert,
      revertReason: step.revertReason,
    };
  }

  private foldUpTo(
    scenario: SimulationScenario,
    uptoIndex: number,
  ): Record<string, Record<string, string>> {
    return foldNodeValues(
      scenario.steps,
      (_step, idx) => this.effectiveStep(scenario, idx)?.changes,
      uptoIndex,
    );
  }

  /** Apply one step: highlights, results, revert meta, node values, flow label. */
  private applyStep(scenario: SimulationScenario, index: number): void {
    const step = scenario.steps[index];
    const effective = this.effectiveStep(scenario, index);

    this.onStateChange({
      currentStepIndex: index,
      highlightedNodes: step.highlightNodes,
      highlightedEdges: step.highlightEdges,
      flowLabel: effective?.flowLabel ?? null,
      error: null,
    });

    if (effective && Object.keys(effective.changes).length > 0) {
      // Emit step results as a separate patch so the store can merge them
      // without clobbering results from previous steps.
      this.onStateChange({ stepResults: { [step.id]: effective.changes } });
    }
    if (effective?.isRevert) {
      this.onStateChange({
        stepMeta: {
          [step.id]: { isRevert: true, revertReason: effective.revertReason },
        },
      });
    }
    this.onStateChange({ nodeValues: this.foldUpTo(scenario, index) });
  }

  // ─── Worker accessor ─────────────────────────────────────────────────────────

  /** Exposes the worker proxy for direct compute calls from custom hooks. */
  get workerApi(): SimWorkerLike | null {
    return this.worker;
  }
}
