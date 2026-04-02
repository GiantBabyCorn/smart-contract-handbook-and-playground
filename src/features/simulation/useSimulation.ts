import { useCallback, useEffect, useRef } from 'react';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { SimulationEngine, type SimulationState } from './SimulationEngine';
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
    const engine = new SimulationEngine((partial: Partial<SimulationState>) => {
      // Translate engine partial-state patches into granular store actions.
      if ('scenario' in partial && partial.scenario != null) {
        store.setScenario(partial.scenario);
      }
      if (
        'currentStepIndex' in partial &&
        partial.currentStepIndex !== undefined
      ) {
        store.setCurrentStep(partial.currentStepIndex);
      }
      if ('isPlaying' in partial && partial.isPlaying !== undefined) {
        store.setIsPlaying(partial.isPlaying);
      }
      if (
        'highlightedNodes' in partial &&
        partial.highlightedNodes !== undefined &&
        'highlightedEdges' in partial &&
        partial.highlightedEdges !== undefined
      ) {
        store.setHighlights(partial.highlightedNodes, partial.highlightedEdges);
      }
      if ('stepResults' in partial && partial.stepResults !== undefined) {
        for (const [stepId, changes] of Object.entries(partial.stepResults)) {
          store.addStepResult(stepId, changes);
        }
      }
      if ('error' in partial) {
        store.setError(partial.error ?? null);
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
    // Store action methods are referentially stable across renders (Zustand
    // guarantee), so this effect only needs to run on mount / unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Action callbacks ──────────────────────────────────────────────────────
  // All read from the store snapshot rather than reactive state to avoid
  // stale closures without adding them to dependency arrays.

  const loadScenario = useCallback((scenario: SimulationScenario) => {
    engineRef.current?.loadScenario(scenario);
  }, []);

  const play = useCallback(() => {
    const { scenario, currentStepIndex, speed } =
      useSimulationStore.getState();
    if (scenario) {
      engineRef.current?.play(scenario, currentStepIndex, speed);
    }
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const stepForward = useCallback(() => {
    const { scenario, currentStepIndex } = useSimulationStore.getState();
    if (scenario) {
      void engineRef.current?.stepForward(scenario, currentStepIndex);
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
    store.setParam(id, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSpeed = useCallback((speed: number) => {
    store.setSpeed(speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
