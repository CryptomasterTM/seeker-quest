import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';

const players = [
  { rank: 1, name: 'SolanaSeeker', xp: 2450, level: 3 },
  { rank: 2, name: 'QuestMaster', xp: 2100, level: 3 },
  { rank: 3, name: 'CryptoNova', xp: 1850, level: 3 },
  { rank: 4, name: 'SeekerPro', xp: 1400, level: 2 },
  { rank: 5, name: 'Cryptomaster', xp: 325, level: 1, you: true },
  { rank: 6, name: 'SolExplorer', xp: 280, level: 1 },
];

export default function LeaderboardScreen() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>BACK</Text>
        </Pressable>

        <Text style={styles.title}>Leaderboard</Text>

        <View style={styles.space} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>SEEKER RANKINGS</Text>
        <Text style={styles.heroTitle}>Climb the ranks.</Text>
        <Text style={styles.heroText}>
          Earn XP through quests and compete with other Seekers.
        </Text>
      </View>

      <View style={styles.yourRank}>
        <Text style={styles.yourRankLabel}>YOUR CURRENT RANK</Text>
        <Text style={styles.yourRankNumber}>#5</Text>
        <Text style={styles.yourRankText}>325 XP</Text>
      </View>

      <Text style={styles.sectionTitle}>Top Seekers</Text>

      {players.map((player) => (
        <View
          key={player.rank}
          style={[
            styles.playerCard,
            player.you && styles.yourCard,
          ]}
        >
          <View style={styles.rank}>
            <Text style={styles.rankText}>#{player.rank}</Text>
          </View>

          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>
              {player.name}
              {player.you ? '  YOU' : ''}
            </Text>

            <Text style={styles.level}>
              LEVEL {player.level}
            </Text>
          </View>

          <View style={styles.xpContainer}>
            <Text style={styles.xp}>{player.xp}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#07111F',
  },

  container: {
    padding: 24,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  back: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  space: {
    width: 40,
  },

  hero: {
    backgroundColor: '#101D2E',
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
  },

  heroLabel: {
    color: '#8B9AAF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },

  heroText: {
    color: '#AAB7C8',
    fontSize: 14,
    lineHeight: 21,
  },

  yourRank: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginBottom: 30,
  },

  yourRankLabel: {
    color: '#07111F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  yourRankNumber: {
    color: '#07111F',
    fontSize: 40,
    fontWeight: '900',
    marginVertical: 4,
  },

  yourRankText: {
    color: '#526174',
    fontSize: 13,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 14,
  },

  playerCard: {
    backgroundColor: '#101D2E',
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  yourCard: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  rank: {
    width: 48,
  },

  rankText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  playerInfo: {
    flex: 1,
  },

  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },

  level: {
    color: '#8B9AAF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  xpContainer: {
    alignItems: 'flex-end',
  },

  xp: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  xpLabel: {
    color: '#8B9AAF',
    fontSize: 9,
    fontWeight: '700',
  },
});