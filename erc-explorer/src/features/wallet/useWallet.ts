/**
 * useWallet — placeholder hook for future wallet integration.
 *
 * Returns a stable, type-safe interface that components can depend on today.
 * When a wallet library is integrated (wagmi, viem, RainbowKit, etc.) this
 * hook should be updated to read real connection state and delegate connect /
 * disconnect to the library — no other files need to change.
 *
 * The shape is intentionally minimal.  Extend as needed when real wallet
 * features are implemented (chainId, balance, signMessage, sendTransaction…).
 */

export interface WalletState {
  /** Whether a wallet is currently connected. */
  isConnected: boolean;
  /** The connected account address, or null when disconnected. */
  address: string | null;
  /** Trigger the wallet connection flow (opens modal, injected provider, etc.). */
  connect: () => Promise<void>;
  /** Disconnect the current wallet session. */
  disconnect: () => Promise<void>;
}

export function useWallet(): WalletState {
  return {
    isConnected: false,
    address: null,
    connect: async () => {
      // TODO: integrate wallet library — e.g. wagmi's `useConnect()`.
    },
    disconnect: async () => {
      // TODO: integrate wallet library — e.g. wagmi's `useDisconnect()`.
    },
  };
}
