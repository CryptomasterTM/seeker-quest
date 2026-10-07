import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { syncProfileProgress } from '../lib/seekerProgress';

type Player = {
  username: string | null;
  display_name: string | null;
  xp: number;
  level: number;
  quests_completed: number;
  streak: number;
};

export default function LeaderboardScreen() {
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'GLOBAL' | 'WEEKLY' | 'EVENT'>('GLOBAL');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      await syncProfileProgress();

      const { data, error } = await supabase.rpc('get_leaderboard');

      if (error) {
        console.log('Leaderboard error:', error);
        return;
      }

      setPlayers(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  function getName(player: Player) {
    return player.display_name || player.username || 'Seeker';
  }

  const sortedPlayers = [...players].sort(
    (a, b) => (b.xp || 0) - (a.xp || 0)
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#55C1FF" />

        <Text style={styles.loadingText}>
          Loading leaderboard...
        </Text>
      </View>
    );
  }

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

        <Text style={styles.eyebrow}>THE SEEKER</Text>

        <Text style={styles.title}>Leaderboard</Text>

        <Text style={styles.subtitle}>
          Complete quests, earn XP and climb the ranks.
        </Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>SEEKER RANKINGS</Text>

          <Text style={styles.heroTitle}>
            {players.length} Seekers
          </Text>

          <Text style={styles.heroText}>
            Global progress across quests and activities.
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {players.reduce(
                  (total, player) => total + (player.xp || 0),
                  0
                ).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>TOTAL XP</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {players.reduce(
                  (total, player) =>
                    total + (player.quests_completed || 0),
                  0
                )}
              </Text>
              <Text style={styles.statLabel}>QUESTS</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {players.reduce(
                  (max, player) =>
                    Math.max(max, player.streak || 0),
                  0
                )}
              </Text>
              <Text style={styles.statLabel}>BEST STREAK</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {(['GLOBAL', 'WEEKLY', 'EVENT'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              style={[
                styles.tab,
                tab === item && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === item && styles.tabTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {tab !== 'GLOBAL' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              {tab === 'WEEKLY'
                ? 'WEEKLY RANKING'
                : 'EVENT RANKING'}
            </Text>

            <Text style={styles.infoText}>
              {tab === 'WEEKLY'
                ? 'Weekly rankings will track activity from the current weekly cycle.'
                : 'Event rankings will show progress from active Seeker events.'}
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            TOP SEEKERS
          </Text>

          <Text style={styles.sectionCount}>
            {sortedPlayers.length} PLAYERS
          </Text>
        </View>

        {sortedPlayers.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◈</Text>

            <Text style={styles.emptyTitle}>
              No rankings yet
            </Text>

            <Text style={styles.emptyText}>
              Start completing quests to appear on the leaderboard.
            </Text>
          </View>
        ) : (
          sortedPlayers.map((player, index) => {
            const rank = index + 1;

            return (
              <View
                key={`${getName(player)}-${rank}`}
                style={[
                  styles.playerCard,
                  rank === 1 && styles.firstCard,
                ]}
              >
                <View style={styles.rankBox}>
                  <Text
                    style={[
                      styles.rank,
                      rank <= 3 && styles.topRank,
                    ]}
                  >
                    #{rank}
                  </Text>
                </View>

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getName(player).slice(0, 1).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {getName(player)}
                  </Text>

                  <Text style={styles.playerMeta}>
                    Level {player.level || 1} •{' '}
                    {player.streak || 0} day streak
                  </Text>

                  <Text style={styles.questMeta}>
                    {player.quests_completed || 0} quests completed
                  </Text>
                </View>

                <View style={styles.scoreBox}>
                  <Text style={styles.score}>
                    {(player.xp || 0).toLocaleString()}
                  </Text>

                  <Text style={styles.scoreLabel}>
                    XP
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            KEEP SEEKING
          </Text>

          <Text style={styles.footerText}>
            More quests. More XP. Higher levels.
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
    paddingBottom: 60,
  },

  loading: {
    flex: 1,
    backgroundColor: '#050814',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#71809D',
    marginTop: 12,
    fontSize: 13,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 18,
  },

  backText: {
    color: '#7F8DA8',
    fontSize: 13,
    fontWeight: '800',
  },

  eyebrow: {
    color: '#42AFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 5,
  },

  subtitle: {
    color: '#8995AE',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },

  hero: {
    marginTop: 20,
    padding: 20,
    borderRadius: 23,
    backgroundColor: '#101735',
    borderWidth: 1,
    borderColor: '#315BFF',
  },

  heroLabel: {
    color: '#8A8CFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 5,
  },

  heroText: {
    color: '#8995AE',
    fontSize: 12,
    marginTop: 5,
  },

  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#273157',
  },

  stat: {
    flex: 1,
  },

  statNumber: {
    color: '#55C1FF',
    fontSize: 18,
    fontWeight: '900',
  },

  statLabel: {
    color: '#63718C',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 3,
  },

  tabs: {
    gap: 8,
    paddingVertical: 18,
  },

  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#26375B',
    backgroundColor: '#0B1121',
  },

  tabActive: {
    backgroundColor: '#176CFF',
    borderColor: '#176CFF',
  },

  tabText: {
    color: '#71809D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  infoCard: {
    padding: 17,
    borderRadius: 18,
    backgroundColor: '#11142C',
    borderWidth: 1,
    borderColor: '#303A72',
    marginBottom: 20,
  },

  infoTitle: {
    color: '#A8A7FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  infoText: {
    color: '#8995AE',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  sectionCount: {
    color: '#596984',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1224',
    borderWidth: 1,
    borderColor: '#1B2945',
    borderRadius: 17,
    padding: 13,
    marginBottom: 9,
  },

  firstCard: {
    borderColor: '#315BFF',
    backgroundColor: '#0E1830',
  },

  rankBox: {
    width: 36,
  },

  rank: {
    color: '#71809D',
    fontSize: 11,
    fontWeight: '900',
  },

  topRank: {
    color: '#55C1FF',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#172B52',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  avatarText: {
    color: '#58BDFF',
    fontSize: 18,
    fontWeight: '900',
  },

  playerInfo: {
    flex: 1,
  },

  playerName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  playerMeta: {
    color: '#687691',
    fontSize: 10,
    marginTop: 4,
  },

  questMeta: {
    color: '#4E5C77',
    fontSize: 9,
    marginTop: 3,
  },

  scoreBox: {
    alignItems: 'flex-end',
  },

  score: {
    color: '#55C1FF',
    fontSize: 14,
    fontWeight: '900',
  },

  scoreLabel: {
    color: '#66738E',
    fontSize: 8,
    marginTop: 2,
  },

  empty: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1B2945',
    backgroundColor: '#0C1224',
  },

  emptyIcon: {
    color: '#55C1FF',
    fontSize: 34,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  emptyText: {
    color: '#71809D',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 5,
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

