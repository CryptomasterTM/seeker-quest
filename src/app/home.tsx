import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useMobileWallet } from '@wallet-ui/react-native-web3js';

const XP_KEY = 'seeker_xp';
const TOTAL_TASKS_KEY = 'seeker_total_tasks';

export default function HomeScreen() {
  const { connect, account } = useMobileWallet();

  const [xp, setXp] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [wallet, setWallet] = useState<string | null>(
    account?.address?.toString() ?? null
  );

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    if (account?.address) {
      setWallet(account.address.toString());
    }
  }, [account]);

  const loadProgress = async () => {
    try {
      const savedXp = Number((await AsyncStorage.getItem(XP_KEY)) || '0');
      const savedTasks = Number(
        (await AsyncStorage.getItem(TOTAL_TASKS_KEY)) || '0'
      );

      setXp(savedXp);
      setTotalTasks(savedTasks);
    } catch {
      setXp(0);
      setTotalTasks(0);
    }
  };

  const handleConnect = async () => {
    try {
      const connectedAccount = await connect();
      const address = connectedAccount?.address?.toString() ?? null;

      if (address) {
        setWallet(address);
        await AsyncStorage.setItem('seeker_wallet', address);
      }
    } catch (error) {
      console.log('WALLET CONNECTION ERROR:', error);
    }
  };

  const level = Math.floor(xp / 1000) + 1;
  const levelXp = xp % 1000;
  const levelProgress = Math.min((levelXp / 1000) * 100, 100);

  const shortWallet = wallet
    ? `${wallet.slice(0, 5)}...${wallet.slice(-5)}`
    : null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>THE SEEKER</Text>
          <Text style={styles.title}>Welcome back, Seeker</Text>
          <Text style={styles.subtitle}>
            Explore. Play. Complete quests. Earn XP.
          </Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() => router.push('/profile' as any)}
        >
          <Text style={styles.profileText}>S</Text>
        </Pressable>
      </View>

      <View style={styles.walletCard}>
        <View style={styles.walletLeft}>
          <Text style={styles.cardEyebrow}>WALLET STATUS</Text>
          <Text style={styles.walletTitle}>
            {wallet ? 'Wallet Connected' : 'Connect your wallet'}
          </Text>
          <Text style={styles.walletAddress}>
            {wallet
              ? shortWallet
              : 'Connect a compatible Solana wallet to participate.'}
          </Text>
        </View>

        {!wallet ? (
          <Pressable style={styles.connectButton} onPress={handleConnect}>
            <Text style={styles.connectText}>CONNECT</Text>
          </Pressable>
        ) : (
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>CONNECTED</Text>
          </View>
        )}
      </View>

      {!wallet && (
        <View style={styles.lockCard}>
          <Text style={styles.lockIcon}>◈</Text>
          <View style={styles.lockContent}>
            <Text style={styles.lockTitle}>Your Seeker journey starts here</Text>
            <Text style={styles.lockText}>
              Connect your Solana wallet to unlock quests, games, tasks,
              events, XP and rewards.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>LEVEL</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>TOTAL XP</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalTasks}</Text>
          <Text style={styles.statLabel}>TASKS DONE</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>SEEKER PROGRESS</Text>
            <Text style={styles.progressTitle}>Level {level}</Text>
          </View>

          <Text style={styles.progressXp}>{levelXp}/1000 XP</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${levelProgress}%` },
            ]}
          />
        </View>

        <Text style={styles.progressHint}>
          {1000 - levelXp} XP until Level {level + 1}
        </Text>
      </View>

      <View style={styles.comboCard}>
        <View style={styles.comboIcon}>
          <Text style={styles.comboIconText}>⚡</Text>
        </View>

        <View style={styles.comboContent}>
          <Text style={styles.sectionEyebrow}>DAILY COMBO</Text>
          <Text style={styles.comboTitle}>Complete today's activities</Text>
          <Text style={styles.comboText}>
            Finish tasks and activities to unlock your daily bonus.
          </Text>
        </View>

        <Pressable
          style={styles.smallButton}
          onPress={() => router.push('/tasks' as any)}
        >
          <Text style={styles.smallButtonText}>OPEN</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>EXPLORE</Text>
          <Text style={styles.sectionTitle}>Your Seeker Hub</Text>
        </View>
      </View>

      <View style={styles.actionGrid}>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/tasks' as any)}
        >
          <Text style={styles.actionIcon}>✓</Text>
          <Text style={styles.actionTitle}>Tasks</Text>
          <Text style={styles.actionText}>Daily quests & challenges</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/games' as any)}
        >
          <Text style={styles.actionIcon}>◆</Text>
          <Text style={styles.actionTitle}>Games</Text>
          <Text style={styles.actionText}>Play & collect XP</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/events' as any)}
        >
          <Text style={styles.actionIcon}>⚡</Text>
          <Text style={styles.actionTitle}>Events</Text>
          <Text style={styles.actionText}>Live Seeker events</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/discover' as any)}
        >
          <Text style={styles.actionIcon}>◉</Text>
          <Text style={styles.actionTitle}>Discover</Text>
          <Text style={styles.actionText}>Learn & explore</Text>
        </Pressable>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.featureBadge}>
          <Text style={styles.featureBadgeText}>QUEST OF THE DAY</Text>
        </View>

        <Text style={styles.featureTitle}>Explore The Seeker</Text>
        <Text style={styles.featureText}>
          Discover the ecosystem, learn something new and keep building your
          Seeker progress.
        </Text>

        <Pressable
          style={styles.featureButton}
          onPress={() => router.push('/tasks' as any)}
        >
          <Text style={styles.featureButtonText}>VIEW QUESTS →</Text>
        </Pressable>
      </View>

      <View style={styles.bottomLinks}>
        <Pressable
          style={styles.bottomButton}
          onPress={() => router.push('/leaderboard' as any)}
        >
          <Text style={styles.bottomButtonText}>LEADERBOARD</Text>
        </Pressable>

        <Pressable
          style={styles.bottomButton}
          onPress={() => router.push('/profile' as any)}
        >
          <Text style={styles.bottomButtonText}>PROFILE</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        THE SEEKER • SOLANA MOBILE • EXPLORE THE ECOSYSTEM
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    padding: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#172554',
    borderWidth: 1,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#e0f2fe',
    fontSize: 17,
    fontWeight: '900',
  },
  walletCard: {
    backgroundColor: '#0b1224',
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  walletLeft: {
    flex: 1,
    paddingRight: 10,
  },
  cardEyebrow: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  walletTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },
  walletAddress: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
  connectButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
  },
  connectText: {
    color: '#03111f',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  connectedBadge: {
    backgroundColor: '#052e2b',
    borderWidth: 1,
    borderColor: '#2dd4bf',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  connectedText: {
    color: '#5eead4',
    fontSize: 9,
    fontWeight: '900',
  },
  lockCard: {
    flexDirection: 'row',
    backgroundColor: '#0d1024',
    borderWidth: 1,
    borderColor: '#312e81',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  lockIcon: {
    color: '#a78bfa',
    fontSize: 27,
    marginRight: 12,
  },
  lockContent: {
    flex: 1,
  },
  lockTitle: {
    color: '#e9d5ff',
    fontSize: 14,
    fontWeight: '900',
  },
  lockText: {
    color: '#a5b4fc',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0b1224',
    borderWidth: 1,
    borderColor: '#172554',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#0b1224',
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionEyebrow: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  progressTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  progressXp: {
    color: '#7dd3fc',
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 9,
    backgroundColor: '#111827',
    borderRadius: 9,
    overflow: 'hidden',
    marginTop: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 9,
  },
  progressHint: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 7,
  },
  comboCard: {
    backgroundColor: '#11112a',
    borderWidth: 1,
    borderColor: '#4338ca',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  comboIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#312e81',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  comboIconText: {
    fontSize: 20,
  },
  comboContent: {
    flex: 1,
  },
  comboTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  comboText: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  smallButton: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    marginLeft: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#0b1224',
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderRadius: 17,
    padding: 15,
    minHeight: 125,
  },
  actionIcon: {
    color: '#7dd3fc',
    fontSize: 22,
    fontWeight: '900',
  },
  actionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 10,
  },
  actionText: {
    color: '#64748b',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  featureCard: {
    backgroundColor: '#101b3a',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 20,
    padding: 18,
    marginTop: 2,
  },
  featureBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#172554',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  featureBadgeText: {
    color: '#7dd3fc',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 12,
  },
  featureText: {
    color: '#a5b4fc',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
  featureButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#38bdf8',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  featureButtonText: {
    color: '#03111f',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  bottomLinks: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  bottomButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    color: '#334155',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 25,
  },
});
