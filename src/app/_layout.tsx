import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MobileWalletProvider, useMobileWallet } from '@wallet-ui/react-native-web3js';
import { clusterApiUrl } from '@solana/web3.js';

const WALLET_IDENTITY = {
  name: 'THE SEEKER',
  uri: 'https://dist-eight-blue-69.vercel.app',
  icon: '/favicon.ico',
};

function WalletGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { account } = useMobileWallet();

  const [ready, setReady] = useState(false);

  const walletAddress = account?.address?.toString() ?? null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (
      walletAddress &&
      (pathname === '/' || pathname === '/auth')
    ) {
      router.replace('/home');
    }
  }, [walletAddress, pathname, ready]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#03040A',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#A855F7"
        />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="home" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="games" />
      <Stack.Screen name="events" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <MobileWalletProvider
      chain="solana:mainnet"
      endpoint={clusterApiUrl('mainnet-beta')}
      identity={WALLET_IDENTITY}
    >
      <WalletGate />
    </MobileWalletProvider>
  );
}

