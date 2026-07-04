import { expose } from 'comlink';
import { simMath } from './simMath';

/**
 * Web Worker entry point.
 *
 * The actual math lives in `simMath.ts` (pure, BigInt-based) so unit tests
 * can exercise it without a Worker or DOM environment; this file only
 * exposes it over comlink.
 */
expose(simMath);
