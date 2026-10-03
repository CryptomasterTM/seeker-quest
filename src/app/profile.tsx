import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useMobileWallet } from '@wallet-ui/react-native-web3js';

type Profile = {
  username: string | null;
  display_name: string | null;
  wallet_address: string | null;
  xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  quests_completed: number;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { connect, account } = useMobileWallet();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [localXp, setLocalXp] = useState(0);
  const [localTasks, setLocalTasks] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth');
        return;
      }

      const { data: profileData, error: profileError } =
        await supabase
          .from('profiles')
          .select(
            'username, display_name, wallet_address, xp, level, streak, longest_streak, quests_completed'
          )
          .eq('id', user.id)
          .single();

      if (profileError) {
        console.log('PROFILE LOAD ERROR:', profileError);
      }

      const { data: badgeData, error: badgeError } =
        await supabase
          .from('badges')
          .select(
            'id, name, description, requirement_type, requirement_value'
          )
          .order('requirement_value', {
            ascending: true,
          });

      if (badgeError) {
        console.log('BADGE LOAD ERROR:', badgeError);
      }

      const { data: earnedData, error: earnedError } =
        await supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', user.id);

      if (earnedError) {
        console.log('EARNED BADGE LOAD ERROR:', earnedError);
      }

      const savedXp = Number(
        await AsyncStorage.getItem('seeker_xp')
      ) || 0;

      const savedTasks = Number(
        await AsyncStorage.getItem('seeker_total_tasks')
      ) || 0;

      setLocalXp(savedXp);
      setLocalTasks(savedTasks);
      setProfile(profileData);
      setBadges(badgeData ?? []);
      setEarnedBadgeIds(
        earnedData?.map((item) => item.badge_id) ?? []
      );
    } catch (error) {
      console.log('PROFILE ERROR:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectWallet() {
    if (connectingWallet) {
      return;
    }

    setConnectingWallet(true);

    try {
      const connectedAccount = await connect();
      const walletAddress = connectedAccount?.address?.toString() ?? null;

      if (!walletAddress) {
        Alert.alert(
          'Wallet not connected',
          'No wallet was connected. Make sure a compatible Solana wallet is available on your device.'
        );
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          wallet_address: walletAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.log('WALLET SAVE ERROR:', error);

        Alert.alert(
          'Wallet connected',
          'Your wallet connected successfully, but we could not save the address to your profile.'
        );

        return;
      }

      await AsyncStorage.setItem(
        'seeker_wallet',
        walletAddress
      );

      setProfile((current) =>
        current
          ? {
              ...current,
              wallet_address: walletAddress,
            }
          : current
      );

      Alert.alert(
        'Wallet connected',
        'Your Solana wallet is now connected to THE SEEKER.'
      );
    } catch (error) {
      console.log('WALLET CONNECTION ERROR:', error);

      Alert.alert(
        'Connection failed',
        'We could not connect your wallet. Please try again.'
      );
    } finally {
      setConnectingWallet(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#55C1FF"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  const name =
    profile?.display_name ||
    profile?.username ||
    'Seeker';

  const username = profile?.username
    ? `@${profile.username}`
    : '@seeker';

  const supabaseXp = profile?.xp ?? 0;
  const xp = Math.max(supabaseXp, localXp);
  const level = Math.max(
    profile?.level ?? 1,
    Math.floor(xp / 1000) + 1
  );

  const streak = profile?.streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const quests = Math.max(
    profile?.quests_completed ?? 0,
    localTasks
  );

  const walletAddress = profile?.wallet_address;

  const currentLevelXp = xp % 1000;
  const progress = currentLevelXp / 1000;
  const xpNeeded = 1000 - currentLevelXp;

  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/home');
            }
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.profileHero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.slice(0, 1).toUpperCase()}
            </Text>
          </View>

          <View style={styles.identity}>
            <Text style={styles.eyebrow}>SEEKER PROFILE</Text>

            <Text style={styles.name}>
              {name}
            </Text>

            <Text style={styles.username}>
              {username}
            </Text>
          </View>

          <View style={styles.levelPill}>
            <Text style={styles.levelNumber}>
              {level}
            </Text>
            <Text style={styles.levelLabel}>
              LVL
            </Text>
          </View>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>
                WALLET STATUS
              </Text>

              <Text style={styles.walletStatus}>
                {walletAddress
                  ? 'CONNECTED'
                  : 'NOT CONNECTED'}
              </Text>
            </View>

            <View
              style={[
                styles.statusDot,
                walletAddress && styles.statusConnected,
              ]}
            />
          </View>

          {walletAddress ? (
            <View style={styles.walletAddressBox}>
              <Text style={styles.walletAddress}>
                {shortWallet}
              </Text>

              <Text style={styles.walletNetwork}>
                SOLANA NETWORK
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.walletDescription}>
                Connect your compatible Solana wallet to
                unlock participation across THE SEEKER.
              </Text>

              <Pressable
                onPress={handleConnectWallet}
                disabled={connectingWallet}
                style={[
                  styles.connectButton,
                  connectingWallet &&
                    styles.connectDisabled,
                ]}
              >
                {connectingWallet ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.connectText}>
                    CONNECT WALLET
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.xpLabel}>
                CURRENT LEVEL
              </Text>

              <Text style={styles.xpLevel}>
                LEVEL {level}
              </Text>
            </View>

            <View style={styles.xpRight}>
              <Text style={styles.xpNumber}>
                {xp.toLocaleString()}
              </Text>

              <Text style={styles.xpSmall}>
                TOTAL XP
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(
                    2,
                    progress * 100
                  )}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressBottom}>
            <Text style={styles.progressText}>
              {currentLevelXp} / 1000 XP
            </Text>

            <Text style={styles.progressText}>
              {xpNeeded} XP to next level
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>

            <Text style={styles.statNumber}>
              {streak}
            </Text>

            <Text style={styles.statLabel}>
              CURRENT STREAK
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚡</Text>

            <Text style={styles.statNumber}>
              {longestStreak}
            </Text>

            <Text style={styles.statLabel}>
              BEST STREAK
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>

            <Text style={styles.statNumber}>
              {quests}
            </Text>

            <Text style={styles.statLabel}>
              QUESTS DONE
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>

            <Text style={styles.statNumber}>
              {earnedBadgeIds.length}
            </Text>

            <Text style={styles.statLabel}>
              BADGES
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            BADGES
          </Text>

          <Text style={styles.sectionCount}>
            {earnedBadgeIds.length}/{badges.length}
          </Text>
        </View>

        {badges.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>◇</Text>

            <Text style={styles.emptyTitle}>
              Badges are waiting
            </Text>

            <Text style={styles.emptyText}>
              Complete quests and activities to unlock
              achievements.
            </Text>
          </View>
        ) : (
          badges.map((badge) => {
            const earned = earnedBadgeIds.includes(
              badge.id
            );

            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  earned && styles.badgeEarned,
                ]}
              >
                <View
                  style={[
                    styles.badgeIcon,
                    earned && styles.badgeIconEarned,
                  ]}
                >
                  <Text style={styles.badgeEmoji}>
                    {earned ? '★' : '◇'}
                  </Text>
                </View>

                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>
                    {badge.name}
                  </Text>

                  <Text style={styles.badgeDescription}>
                    {badge.description}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.badgeStatus,
                    earned && styles.badgeStatusEarned,
                  ]}
                >
                  {earned ? 'EARNED' : 'LOCKED'}
                </Text>
              </View>
            );
          })
        )}

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push('/rewards' as any)
            }
          >
            <Text style={styles.actionIcon}>🎁</Text>

            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>
                Rewards & Referrals
              </Text>

              <Text style={styles.actionText}>
                Invite friends and explore available rewards.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push('/tasks' as any)
            }
          >
            <Text style={styles.actionIcon}>🎯</Text>

            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>
                Your Quests
              </Text>

              <Text style={styles.actionText}>
                Keep completing tasks to earn more XP.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push('/games' as any)
            }
          >
            <Text style={styles.actionIcon}>🎮</Text>

            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>
                Mini Games
              </Text>

              <Text style={styles.actionText}>
                Play games and build your Seeker progress.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            THE SEEKER
          </Text>

          <Text style={styles.footerText}>
            Explore. Complete. Level up.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },

  scroll: {
    padding: 20,
    paddingBottom: 65,
  },

  loading: {
    flex: 1,
    backgroundColor: '#050814',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#71809D',
    fontSize: 13,
    marginTop: 12,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 14,
  },

  backText: {
    color: '#7F8DA8',
    fontSize: 13,
    fontWeight: '800',
  },

  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 23,
    backgroundColor: '#0C1224',
    borderWidth: 1,
    borderColor: '#1E3155',
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 23,
    backgroundColor: '#172F5C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#347BFF',
  },

  avatarText: {
    color: '#55C1FF',
    fontSize: 29,
    fontWeight: '900',
  },

  identity: {
    flex: 1,
    marginLeft: 14,
  },

  eyebrow: {
    color: '#55C1FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },

  username: {
    color: '#697792',
    fontSize: 12,
    marginTop: 2,
  },

  levelPill: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#111C3A',
    borderWidth: 1,
    borderColor: '#315BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  levelNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  levelLabel: {
    color: '#62718F',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  walletCard: {
    marginTop: 15,
    padding: 18,
    borderRadius: 21,
    backgroundColor: '#101735',
    borderWidth: 1,
    borderColor: '#315BFF',
  },

  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  walletLabel: {
    color: '#858BFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  walletStatus: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },

  statusDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#697792',
  },

  statusConnected: {
    backgroundColor: '#45D6A8',
  },

  walletDescription: {
    color: '#8995AE',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },

  walletAddressBox: {
    marginTop: 12,
    padding: 13,
    borderRadius: 13,
    backgroundColor: '#0A1021',
    borderWidth: 1,
    borderColor: '#21345A',
  },

  walletAddress: {
    color: '#55C1FF',
    fontSize: 14,
    fontWeight: '900',
  },

  walletNetwork: {
    color: '#5E6D88',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },

  connectButton: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: '#176CFF',
    alignItems: 'center',
  },

  connectDisabled: {
    opacity: 0.65,
  },

  connectText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  xpCard: {
    marginTop: 15,
    padding: 19,
    borderRadius: 21,
    backgroundColor: '#0C1224',
    borderWidth: 1,
    borderColor: '#1B2945',
  },

  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  xpLabel: {
    color: '#687691',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  xpLevel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },

  xpRight: {
    alignItems: 'flex-end',
  },

  xpNumber: {
    color: '#55C1FF',
    fontSize: 21,
    fontWeight: '900',
  },

  xpSmall: {
    color: '#65718D',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  progressTrack: {
    height: 8,
    marginTop: 18,
    backgroundColor: '#17223B',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2684FF',
    borderRadius: 10,
  },

  progressBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  progressText: {
    color: '#657895',
    fontSize: 9,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 15,
  },

  statCard: {
    width: '48.5%',
    minHeight: 105,
    padding: 14,
    borderRadius: 17,
    backgroundColor: '#0C1224',
    borderWidth: 1,
    borderColor: '#1B2945',
  },

  statIcon: {
    fontSize: 17,
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 7,
  },

  statLabel: {
    color: '#62718C',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 27,
    marginBottom: 11,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },

  sectionCount: {
    color: '#64728C',
    fontSize: 9,
    fontWeight: '900',
  },

  emptyCard: {
    padding: 25,
    alignItems: 'center',
    borderRadius: 19,
    backgroundColor: '#0C1224',
    borderWidth: 1,
    borderColor: '#1B2945',
  },

  emptyIcon: {
    color: '#55C1FF',
    fontSize: 34,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8,
  },

  emptyText: {
    color: '#71809D',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 5,
  },

  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    marginBottom: 9,
    borderRadius: 17,
    backgroundColor: '#0C1224',
    borderWidth: 1,
    borderColor: '#1B2945',
    opacity: 0.55,
  },

  badgeEarned: {
    opacity: 1,
    borderColor: '#315BFF',
    backgroundColor: '#0E1830',
  },

  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151C2E',
  },

  badgeIconEarned: {
    backgroundColor: '#172F5C',
  },

  badgeEmoji: {
    color: '#55C1FF',
    fontSize: 21,
    fontWeight: '900',
  },

  badgeInfo: {
    flex: 1,
    marginLeft: 11,
  },

  badgeName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  badgeDescription: {
    color: '#687691',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  badgeStatus: {
    color: '#596780',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 7,
  },

  badgeStatusEarned: {
    color: '#55D8FF',
  },

  actions: {
    marginTop: 18,
    gap: 9,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#0C1224',
    borderWidth: 1,
    borderColor: '#1B2945',
  },

  actionIcon: {
    fontSize: 20,
    width: 34,
  },

  actionInfo: {
    flex: 1,
    marginLeft: 4,
  },

  actionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  actionText: {
    color: '#687691',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  arrow: {
    color: '#64728C',
    fontSize: 27,
    marginLeft: 8,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 30,
  },

  footerTitle: {
    color: '#52627E',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footerText: {
    color: '#3F4D66',
    fontSize: 11,
    marginTop: 6,
  },
});


