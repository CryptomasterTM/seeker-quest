import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MobileWalletProvider } from '@wallet-ui/react-native-web3js';
import { clusterApiUrl } from '@solana/web3.js';
import { supabase } from '../lib/supabase';

const WALLET_IDENTITY = {
  name: 'THE SEEKER',
  uri: 'https://dist-eight-blue-69.vercel.app',
  icon: '/favicon.ico',
};

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSessionReady(true);

      if (!session && pathname !== '/' && pathname !== '/auth') {
        router.replace('/auth');
        return;
      }

      if (
        session &&
        (pathname === '/' || pathname === '/auth')
      ) {
        router.replace('/home');
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        router.replace('/auth');
        return;
      }

      if (
        event === 'SIGNED_IN' &&
        session &&
        (pathname === '/' || pathname === '/auth')
      ) {
        router.replace('/home');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  if (!sessionReady) {
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
    <MobileWalletProvider
      chain="solana:mainnet"
      endpoint={clusterApiUrl('mainnet-beta')}
      identity={WALLET_IDENTITY}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="home" />
        <Stack.Screen name="discover" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="profile" />
      </Stack>
    </MobileWalletProvider>
  );
}
