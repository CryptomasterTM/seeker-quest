import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMobileWallet } from '@wallet-ui/react-native-web3js';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import {
  getXp,
  getTotalTasks,
  getCheckinState,
} from '../lib/seekerProgress';

type ProfileData = {
  username: string | null;
  display_name: string | null;
  wallet_address: string | null;
  xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  quests_completed: number;
};

const XP_KEY = 'seeker_xp';
const TOTAL_TASKS_KEY = 'seeker_total_tasks';
const WALLET_KEY = 'seeker_wallet';

export default function ProfileScreen() {
  const router = useRouter();
  const { connect, disconnect, account } = useMobileWallet();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [savedWallet, setSavedWallet] = useState<string | null>(null);

  const liveWalletAddress = account?.address?.toString() ?? null;

  const walletAddress =
    liveWalletAddress || savedWallet || profile?.wallet_address || null;

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!liveWalletAddress) return;

    AsyncStorage.setItem(WALLET_KEY, liveWalletAddress);

    setProfile((current) =>
      current
        ? {
            ...current,
            wallet_address: liveWalletAddress,
          }
        : current,
    );
  }, [liveWalletAddress]);

  async function loadProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let currentProfile: ProfileData = {
        username: null,
        display_name: 'Seeker',
        wallet_address: null,
        xp: 0,
        level: 1,
        streak: 0,
        longest_streak: 0,
        quests_completed: 0,
      };

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select(
            'username, display_name, wallet_address, xp, level, streak, longest_streak, quests_completed',
          )
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          currentProfile = {
            username: data.username ?? null,
            display_name: data.display_name ?? 'Seeker',
            wallet_address: data.wallet_address ?? null,
            xp: Number(data.xp ?? 0),
            level: Number(data.level ?? 1),
            streak: Number(data.streak ?? 0),
            longest_streak: Number(data.longest_streak ?? 0),
            quests_completed: Number(data.quests_completed ?? 0),
          };
        }
      }

      const [savedXp, savedTasks, savedWallet] =
        await Promise.all([
          AsyncStorage.getItem(XP_KEY),
          AsyncStorage.getItem(TOTAL_TASKS_KEY),
          AsyncStorage.getItem(WALLET_KEY),
        ]);

      const localXp = Number(savedXp ?? 0);
      const localTasks = Number(savedTasks ?? 0);

      currentProfile.xp = Math.max(currentProfile.xp, localXp);
      currentProfile.level =
        Math.floor(currentProfile.xp / 1000) + 1;
      currentProfile.quests_completed = Math.max(
        currentProfile.quests_completed,
        localTasks,
      );

      if (savedWallet) {
        currentProfile.wallet_address = savedWallet;
      }

      setSavedWallet(savedWallet ?? null);

      setProfile(currentProfile);
    } catch (error) {
      console.log('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectWallet() {
    if (connecting) return;

    try {
      setConnecting(true);

      const connectedAccount = await connect();
      const address =
        connectedAccount?.address?.toString() ?? null;

      if (!address) {
        Alert.alert(
          'Wallet Not Connected',
          'No wallet address was returned.',
        );
        return;
      }

      await AsyncStorage.setItem(WALLET_KEY, address);
      setSavedWallet(address);

      setProfile((current) =>
        current
          ? {
              ...current,
              wallet_address: address,
            }
          : current,
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('profiles')
          .update({
            wallet_address: address,
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.log('Wallet connection error:', error);

      Alert.alert(
        'Wallet Connection',
        'Wallet connection was cancelled or could not be completed.',
      );
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnectWallet() {
    try {
      await disconnect();
    } catch (error) {
      console.log('Wallet disconnect error:', error);
    }

    await AsyncStorage.removeItem(WALLET_KEY);
    setSavedWallet(null);

    setProfile((current) =>
      current
        ? {
            ...current,
            wallet_address: null,
          }
        : current,
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('profiles')
        .update({
          wallet_address: null,
        })
        .eq('id', user.id);
    }
  }

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const streak = profile?.streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const questsCompleted = profile?.quests_completed ?? 0;

  const levelProgress = useMemo(() => {
    const progress = xp % 1000;
    return Math.min(progress / 1000, 1);
  }, [xp]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>
          Loading Seeker Profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>THE SEEKER</Text>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Your progress, wallet and achievements.
        </Text>

        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.display_name || 'S')[0].toUpperCase()}
            </Text>
          </View>

          <View style={styles.identityBody}>
            <Text style={styles.displayName}>
              {profile?.display_name || 'Seeker'}
            </Text>

            <Text style={styles.username}>
              {profile?.username
                ? `@${profile.username}`
                : 'Seeker account'}
            </Text>
          </View>

          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>LEVEL</Text>
            <Text style={styles.levelValue}>{level}</Text>
          </View>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                WALLET
              </Text>
              <Text style={styles.walletTitle}>
                {walletAddress
                  ? 'Wallet Connected'
                  : 'Connect Wallet'}
              </Text>
            </View>

            <View
              style={[
                styles.statusDot,
                walletAddress
                  ? styles.statusConnected
                  : styles.statusDisconnected,
              ]}
            />
          </View>

          {walletAddress ? (
            <>
              <Text style={styles.walletAddress}>
                {walletAddress.slice(0, 8)}...
                {walletAddress.slice(-8)}
              </Text>

              <Pressable
                style={styles.disconnectButton}
                onPress={handleDisconnectWallet}
              >
                <Text style={styles.disconnectText}>
                  DISCONNECT
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.walletDescription}>
                Connect your compatible Solana wallet to
                participate in THE SEEKER.
              </Text>

              <Pressable
                style={styles.connectButton}
                onPress={handleConnectWallet}
                disabled={connecting}
              >
                <Text style={styles.connectText}>
                  {connecting
                    ? 'CONNECTING...'
                    : 'CONNECT WALLET'}
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressLabel}>
                TOTAL XP
              </Text>
              <Text style={styles.xpValue}>{xp}</Text>
            </View>

            <View style={styles.progressRight}>
              <Text style={styles.progressLabel}>
                NEXT LEVEL
              </Text>
              <Text style={styles.nextLevel}>
                {1000 - (xp % 1000)} XP
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${levelProgress * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>SEEKER STATS</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {questsCompleted}
            </Text>
            <Text style={styles.statLabel}>
              QUESTS
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {streak}
            </Text>
            <Text style={styles.statLabel}>
              STREAK
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {longestStreak}
            </Text>
            <Text style={styles.statLabel}>
              BEST STREAK
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>QUICK ACCESS</Text>

        <View style={styles.actionGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/tasks' as any)}
          >
            <Text style={styles.actionIcon}>✦</Text>
            <Text style={styles.actionTitle}>
              Quests
            </Text>
            <Text style={styles.actionDescription}>
              Earn XP
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/games' as any)}
          >
            <Text style={styles.actionIcon}>◉</Text>
            <Text style={styles.actionTitle}>
              Games
            </Text>
            <Text style={styles.actionDescription}>
              Play & score
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/events' as any)}
          >
            <Text style={styles.actionIcon}>◆</Text>
            <Text style={styles.actionTitle}>
              Events
            </Text>
            <Text style={styles.actionDescription}>
              Join events
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/leaderboard')}
          >
            <Text style={styles.actionIcon}>★</Text>
            <Text style={styles.actionTitle}>
              Rankings
            </Text>
            <Text style={styles.actionDescription}>
              View leaderboard
            </Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            SEEKER REWARDS
          </Text>
          <Text style={styles.infoText}>
            Complete quests, play games, join events and
            build your streak to grow your Seeker profile.
          </Text>
        </View>

        <Pressable
          style={styles.homeButton}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.homeButtonText}>
            BACK TO HOME
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          THE SEEKER • Explore. Play. Earn.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#03040A',
  },

  loading: {
    flex: 1,
    backgroundColor: '#03040A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#A855F7',
    fontSize: 15,
    fontWeight: '700',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 26,
  },

  eyebrow: {
    color: '#22D3EE',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },

  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1020',
    borderWidth: 1,
    borderColor: '#202A44',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#1A1630',
    borderWidth: 1,
    borderColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },

  identityBody: {
    flex: 1,
  },

  displayName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  username: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },

  levelBadge: {
    alignItems: 'flex-end',
  },

  levelLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  levelValue: {
    color: '#22D3EE',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },

  walletCard: {
    backgroundColor: '#0B1020',
    borderWidth: 1,
    borderColor: '#202A44',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },

  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionEyebrow: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  walletTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },

  statusDot: {
    width: 11,
    height: 11,
    borderRadius: 99,
  },

  statusConnected: {
    backgroundColor: '#5EEAD4',
  },

  statusDisconnected: {
    backgroundColor: '#64748B',
  },

  walletAddress: {
    color: '#22D3EE',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
  },

  walletDescription: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  connectButton: {
    backgroundColor: '#A855F7',
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 15,
  },

  connectText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  disconnectButton: {
    backgroundColor: '#121827',
    borderWidth: 1,
    borderColor: '#26324D',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },

  disconnectText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  progressCard: {
    backgroundColor: '#0B1020',
    borderWidth: 1,
    borderColor: '#202A44',
    borderRadius: 22,
    padding: 18,
    marginBottom: 28,
  },

  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressRight: {
    alignItems: 'flex-end',
  },

  progressLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  xpValue: {
    color: '#22D3EE',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 3,
  },

  nextLevel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
  },

  progressTrack: {
    height: 9,
    backgroundColor: '#182238',
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 18,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 99,
  },

  sectionTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#0B1020',
    borderWidth: 1,
    borderColor: '#202A44',
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: 'center',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },

  statLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 5,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  actionCard: {
    width: '48%',
    backgroundColor: '#0B1020',
    borderWidth: 1,
    borderColor: '#202A44',
    borderRadius: 18,
    padding: 15,
  },

  actionIcon: {
    color: '#A855F7',
    fontSize: 19,
    fontWeight: '900',
  },

  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 9,
  },

  actionDescription: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: '#0A1320',
    borderWidth: 1,
    borderColor: '#164E63',
    borderRadius: 18,
    padding: 16,
  },

  infoTitle: {
    color: '#22D3EE',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  infoText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  homeButton: {
    backgroundColor: '#121827',
    borderWidth: 1,
    borderColor: '#26324D',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },

  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  footer: {
    color: '#334155',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 24,
  },
});



