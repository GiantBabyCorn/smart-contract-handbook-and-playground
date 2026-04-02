export interface SimWorkerApi {
  computeSwap(params: { reserveIn: string; reserveOut: string; amountIn: string }): { amountOut: string; priceImpact: string };
  computeConcentratedSwap(params: { tickLower: number; tickUpper: number; liquidity: string; amountIn: string }): { amountOut: string; crossedTicks: number };
  computeInterest(params: { principal: string; ratePerSecond: string; duration: number }): { accruedInterest: string; totalDebt: string };
  computeCdpRatio(params: { collateral: string; debt: string; price: string }): { ratio: string; isLiquidatable: boolean };
  computeFacetRoute(params: { selector: string; facets: Array<{ selectors: string[]; address: string }> }): { matchedFacet: string };
  computeStableswap(params: { balances: string[]; amountIn: string; indexIn: number; indexOut: number; amp: string }): { amountOut: string; fee: string };
  computeRebase(params: { shares: string; totalShares: string; totalPooledEth: string; newRewards: string }): { newBalance: string; rewardPerShare: string };
}

import { wrap } from 'comlink';

const worker = new Worker(
  new URL('./simulation.worker.ts', import.meta.url),
  { type: 'module' }
);

export const simWorker = wrap<SimWorkerApi>(worker);
