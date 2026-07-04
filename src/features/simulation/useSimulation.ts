import { useCallback, useEffect, useRef } from 'react';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { SimulationEngine, type EnginePatch } from './SimulationEngine';
import { simWorker } from './workerApi';
import type { SimulationScenario } from '@/data/types';

/**
 * Primary hook for driving the simulation UI.
 *
 * Creates a `SimulationEngine` backed by the shared comlink worker proxy,
 * wires all engine state-change callbacks to the Zustand store, and returns
 * a stable set of action functions plus the full reactive store snapshot.
 *
 * Action callbacks all read current state directly from the store via
 * `useSimulationStore.getState()` so they never go stale despite having no
 * reactive dependencies — this makes them safe to pass as props without
 * causing excessive re-renders.
 */
export function useSimulation() {
  const store = useSimulationStore();
  const engineRef = useRef<SimulationEngine | null>(null);

  // ─── Engine lifecycle ──────────────────────────────────────────────────────

  useEffect(() => {
    const engine = new SimulationEngine((partial: EnginePatch) => {
      const s = useSimulationStore.getState();
      // Translate engine partial-state patches into granular store actions.
      if (partial.resetRun) {
        s.reset();
      }
      if ('scenario' in partial && partial.scenario != null) {
        s.setScenario(partial.scenario);
      }
      if ('params' in partial && partial.params !== undefined) {
        for (const [id, value] of Object.entries(partial.params)) {
          s.setParam(id, value);
        }
      }
      if (
        'currentStepIndex' in partial &&
        partial.currentStepIndex !== undefined
      ) {
        s.setCurrentStep(partial.currentStepIndex);
      }
      if ('isPlaying' in partial && partial.isPlaying !== undefined) {
        s.setIsPlaying(partial.isPlaying);
      }
      if (
        'highlightedNodes' in partial &&
        partial.highlightedNodes !== undefined &&
        'highlightedEdges' in partial &&
        partial.highlightedEdges !== undefined
      ) {
        s.setHighlights(partial.highlightedNodes, partial.highlightedEdges);
      }
      if ('stepResults' in partial && partial.stepResults !== undefined) {
        for (const [stepId, changes] of Object.entries(partial.stepResults)) {
          s.addStepResult(stepId, changes);
        }
      }
      if ('stepMeta' in partial && partial.stepMeta !== undefined) {
        for (const [stepId, meta] of Object.entries(partial.stepMeta)) {
          s.addStepMeta(stepId, meta);
        }
      }
      if ('nodeValues' in partial && partial.nodeValues !== undefined) {
        s.setNodeValues(partial.nodeValues);
      }
      if ('flowLabel' in partial) {
        s.setFlowLabel(partial.flowLabel ?? null);
      }
      if ('error' in partial) {
        s.setError(partial.error ?? null);
      }
    });

    // Wire the shared comlink worker proxy into the engine.
    engine.setWorker(
      simWorker as unknown as Parameters<typeof engine.setWorker>[0],
    );
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // The patch bridge reads store actions via getState(), so this effect
    // only needs to run on mount / unmount.
  }, []);

  // ─── Action callbacks ──────────────────────────────────────────────────────
  // All read from the store snapshot rather than reactive state to avoid
  // stale closures without adding them to dependency arrays.

  const loadScenario = useCallback((scenario: SimulationScenario) => {
    engineRef.current?.loadScenario(scenario);
  }, []);

  const play = useCallback(() => {
    const { scenario, currentStepIndex, speed, params } =
      useSimulationStore.getState();
    if (scenario) {
      engineRef.current?.play(scenario, currentStepIndex, speed, params);
    }
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const stepForward = useCallback(() => {
    const { scenario, currentStepIndex, params } =
      useSimulationStore.getState();
    if (scenario) {
      void engineRef.current?.stepForward(scenario, currentStepIndex, params);
    }
  }, []);

  const stepBack = useCallback(() => {
    const { scenario, currentStepIndex } = useSimulationStore.getState();
    if (scenario) {
      engineRef.current?.stepBack(scenario, currentStepIndex);
    }
  }, []);

  const reset = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  const setParam = useCallback((id: string, value: string) => {
    const { currentStepIndex } = useSimulationStore.getState();
    // Route through the engine so the computed run is invalidated (and the
    // run reset when already started). Fallback to the store pre-mount.
    if (engineRef.current) {
      engineRef.current.setParam(id, value, currentStepIndex);
    } else {
      useSimulationStore.getState().setParam(id, value);
    }
  }, []);

  const setSpeed = useCallback((speed: number) => {
    useSimulationStore.getState().setSpeed(speed);
  }, []);

  // ─── Derived helpers ───────────────────────────────────────────────────────

  const totalSteps = store.scenario?.steps.length ?? 0;
  const currentStep =
    store.scenario != null && store.currentStepIndex >= 0
      ? (store.scenario.steps[store.currentStepIndex] ?? null)
      : null;
  const isAtStart = store.currentStepIndex <= 0;
  const isAtEnd =
    store.scenario !== null &&
    store.currentStepIndex >= store.scenario.steps.length - 1;

  return {
    // ─── Reactive store state ──────────────────────────────────────────────
    scenario: store.scenario,
    currentStepIndex: store.currentStepIndex,
    isPlaying: store.isPlaying,
    speed: store.speed,
    params: store.params,
    stepResults: store.stepResults,
    stepMeta: store.stepMeta,
    nodeValues: store.nodeValues,
    flowLabel: store.flowLabel,
    highlightedNodes: store.highlightedNodes,
    highlightedEdges: store.highlightedEdges,
    error: store.error,

    // ─── Derived ──────────────────────────────────────────────────────────
    totalSteps,
    currentStep,
    isAtStart,
    isAtEnd,

    // ─── Actions ──────────────────────────────────────────────────────────
    loadScenario,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setParam,
    setSpeed,
  };
}
