import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
} from '@solana-mobile/wallet-adapter-mobile';

let adapter: SolanaMobileWalletAdapter | null = null;

function getAdapter(): SolanaMobileWalletAdapter {
  if (!adapter) {
    adapter = new SolanaMobileWalletAdapter({
      addressSelector: createDefaultAddressSelector(),
      appIdentity: {
        name: 'THE SEEKER',
        uri: 'https://dist-eight-blue-69.vercel.app',
        icon: 'https://dist-eight-blue-69.vercel.app/favicon.ico',
      },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      chain: 'solana:mainnet',
      onWalletNotFound: async () => {
        console.log('No compatible Solana Mobile Wallet Adapter wallet found.');
      },
    });
  }

  return adapter;
}

export async function connectWallet(): Promise<string | null> {
  try {
    const wallet = getAdapter();

    await wallet.connect();

    const publicKey = wallet.publicKey;

    if (!publicKey) {
      console.log('Wallet connected but no public key was returned.');
      return null;
    }

    return publicKey.toBase58();
  } catch (error) {
    console.log('WALLET CONNECTION ERROR:', error);
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    if (adapter?.connected) {
      await adapter.disconnect();
    }
  } catch (error) {
    console.log('WALLET DISCONNECT ERROR:', error);
  }
}

export function getConnectedWallet(): string | null {
  try {
    return adapter?.publicKey?.toBase58() ?? null;
  } catch {
    return null;
  }
}
