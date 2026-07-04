export const SITE_NAME = 'Smart Contract Handbook';
export const SITE_URL = 'https://smart-contract-handbook.giantbabycorn.finance';

// Category order/labels now live in the single category registry
// (src/data/categories.ts, plan.md §B1). Re-exported here so the many
// existing `@/utils/constants` imports keep working unchanged.
export { CATEGORY_ORDER, CATEGORY_LABELS } from '@/data/categories';
