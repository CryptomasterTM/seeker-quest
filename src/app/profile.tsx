import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>BACK</Text>
        </Pressable>

        <Text style={styles.title}>Profile</Text>

        <View style={styles.space} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>

        <Text style={styles.name}>Cryptomaster</Text>
        <Text style={styles.username}>Seeker</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>325</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>STREAK</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>BADGES</Text>
        </View>
      </View>

      <View style={styles.levelCard}>
        <Text style={styles.label}>CURRENT LEVEL</Text>
        <Text style={styles.level}>Newcomer</Text>
        <Text style={styles.levelText}>Level 1</Text>

        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.progressText}>
          325 / 500 XP
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Your Journey</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Quests Completed</Text>
        <Text style={styles.infoValue}>1</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Current Rank</Text>
        <Text style={styles.infoValue}>#5</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Seeker Status</Text>
        <Text style={styles.infoValue}>Active</Text>
      </View>
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

  profileCard: {
    backgroundColor: '#101D2E',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    marginBottom: 18,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarText: {
    color: '#07111F',
    fontSize: 30,
    fontWeight: '900',
  },

  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },

  username: {
    color: '#8B9AAF',
    fontSize: 13,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#101D2E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 5,
  },

  statLabel: {
    color: '#8B9AAF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  levelCard: {
    backgroundColor: '#101D2E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },

  label: {
    color: '#8B9AAF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },

  level: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },

  levelText: {
    color: '#8B9AAF',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 15,
  },

  progressBar: {
    height: 8,
    backgroundColor: '#1D2B3D',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  progressText: {
    color: '#8B9AAF',
    fontSize: 11,
    marginTop: 8,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 14,
  },

  infoCard: {
    backgroundColor: '#101D2E',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoTitle: {
    color: '#AAB7C8',
    fontSize: 14,
    fontWeight: '600',
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});