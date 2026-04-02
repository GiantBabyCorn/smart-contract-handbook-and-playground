import type { ReactNode } from 'react';

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * WalletProvider — placeholder for future wallet integration.
 *
 * This component is intentionally a thin pass-through today.  When a wallet
 * library (e.g. wagmi, RainbowKit, ConnectKit) is adopted it should:
 *   1. Create and provide a WagmiConfig / QueryClientProvider here.
 *   2. Expose the connection state via the `useWallet` hook (see useWallet.ts).
 *   3. Wrap the app at the router root in main.tsx / App.tsx.
 *
 * Keeping a dedicated provider component in place now means downstream
 * components that rely on wallet context can import `useWallet` without any
 * changes once the real integration is added.
 */
export default function WalletProvider({ children }: WalletProviderProps) {
  return <>{children}</>;
}
