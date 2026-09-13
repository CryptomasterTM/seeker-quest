import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';

const quests = [
  {
    id: 1,
    title: 'Discover a Solana Mobile app',
    description: 'Explore the Seeker ecosystem and discover an app.',
    xp: 100,
  },
  {
    id: 2,
    title: 'Learn About Solana',
    description: 'Learn one useful fact about the Solana ecosystem.',
    xp: 50,
  },
  {
    id: 3,
    title: 'Explore the Seeker Ecosystem',
    description: 'Discover something new inside the Seeker ecosystem.',
    xp: 75,
  },
  {
    id: 4,
    title: 'Complete the Daily Challenge',
    description: 'Finish today’s final challenge and earn extra XP.',
    xp: 100,
  },
];

const levels = [
  { min: 0, max: 500, name: 'Newcomer' },
  { min: 500, max: 1500, name: 'Explorer' },
  { min: 1500, max: 3000, name: 'Builder' },
  { min: 3000, max: 5000, name: 'Seeker' },
  { min: 5000, max: Infinity, name: 'Pathfinder' },
];

export default function HomeScreen() {
  const [completedQuests, setCompletedQuests] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

  const completeQuest = (questId: number) => {
    if (completedQuests.includes(questId)) return;

    setCompletedQuests([...completedQuests, questId]);

    if (completedQuests.length === 0) {
      setStreak(1);
    }
  };

  const totalXp = completedQuests.reduce((total, questId) => {
    const quest = quests.find((item) => item.id === questId);
    return total + (quest?.xp || 0);
  }, 0);

  const levelIndex =
    levels.findIndex(
      (level) => totalXp >= level.min && totalXp < level.max
    );

  const currentLevel = levels[levelIndex] || levels[0];
  const levelNumber = levelIndex + 1;
  const nextLevel = levels[levelIndex + 1];

  const levelProgress = nextLevel
    ? ((totalXp - currentLevel.min) /
        (currentLevel.max - currentLevel.min)) *
      100
    : 100;

  const progress = (completedQuests.length / quests.length) * 100;

  const badges = [
    {
      name: 'First Step',
      description: 'Complete your first quest',
      unlocked: completedQuests.length >= 1,
    },
    {
      name: 'Explorer',
      description: 'Complete 5 quests',
      unlocked: completedQuests.length >= 5,
    },
    {
      name: 'Seeker',
      description: 'Reach 500 XP',
      unlocked: totalXp >= 500,
    },
    {
      name: 'Streak Starter',
      description: 'Reach a 3 day streak',
      unlocked: streak >= 3,
    },
  ];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.smallText}>WELCOME BACK</Text>
          <Text style={styles.title}>Seeker Quest</Text>
        </View>

        <Pressable
          style={styles.avatar}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.avatarText}>S</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalXp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{streak}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
      </View>

      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View>
            <Text style={styles.levelLabel}>LEVEL {levelNumber}</Text>
            <Text style={styles.levelName}>{currentLevel.name}</Text>
          </View>

          <Text style={styles.levelXp}>
            {nextLevel
              ? `${totalXp} / ${currentLevel.max} XP`
              : `${totalXp} XP`}
          </Text>
        </View>

        <View style={styles.levelBar}>
          <View
            style={[
              styles.levelFill,
              { width: `${Math.min(levelProgress, 100)}%` },
            ]}
          />
        </View>

        {nextLevel && (
          <Text style={styles.nextLevelText}>
            {currentLevel.max - totalXp} XP until {nextLevel.name}
          </Text>
        )}
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressText}>
              {completedQuests.length} of {quests.length} quests completed
            </Text>
          </View>

          <Text style={styles.progressPercent}>
            {Math.round(progress)}%
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Explore</Text>

      <View style={styles.navigationGrid}>
        <Pressable
          style={styles.navigationCard}
          onPress={() => router.push('/discover')}
        >
          <View style={styles.navigationIcon}>
            <Text style={styles.navigationIconText}>D</Text>
          </View>

          <Text style={styles.navigationTitle}>Discover</Text>

          <Text style={styles.navigationDescription}>
            Explore the Seeker ecosystem.
          </Text>
        </Pressable>

        <Pressable
          style={styles.navigationCard}
          onPress={() => router.push('/leaderboard')}
        >
          <View style={styles.navigationIcon}>
            <Text style={styles.navigationIconText}>L</Text>
          </View>

          <Text style={styles.navigationTitle}>Leaderboard</Text>

          <Text style={styles.navigationDescription}>
            See how you rank against other Seekers.
          </Text>
        </Pressable>

        <Pressable
          style={styles.navigationCard}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.navigationIcon}>
            <Text style={styles.navigationIconText}>P</Text>
          </View>

          <Text style={styles.navigationTitle}>Profile</Text>

          <Text style={styles.navigationDescription}>
            View your progress and journey.
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.badgesScroll}
      >
        {badges.map((badge) => (
          <View
            key={badge.name}
            style={[
              styles.badgeCard,
              !badge.unlocked && styles.lockedBadge,
            ]}
          >
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeIcon}>
                {badge.unlocked ? 'S' : '?'}
              </Text>
            </View>

            <Text style={styles.badgeName}>{badge.name}</Text>

            <Text style={styles.badgeDescription}>
              {badge.description}
            </Text>

            <Text style={styles.badgeStatus}>
              {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Daily Quests</Text>

      {quests.map((quest) => {
        const completed = completedQuests.includes(quest.id);

        return (
          <View key={quest.id} style={styles.questCard}>
            <View style={styles.questTop}>
              <Text style={styles.questLabel}>QUEST {quest.id}</Text>
              <Text style={styles.xp}>+{quest.xp} XP</Text>
            </View>

            <Text style={styles.questTitle}>{quest.title}</Text>

            <Text style={styles.questDescription}>
              {quest.description}
            </Text>

            <Pressable
              style={[
                styles.questButton,
                completed && styles.completedButton,
              ]}
              onPress={() => completeQuest(quest.id)}
              disabled={completed}
            >
              <Text style={styles.questButtonText}>
                {completed ? 'QUEST COMPLETED' : 'START QUEST'}
              </Text>
            </Pressable>
          </View>
        );
      })}
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
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  smallText: {
    color: '#8B9AAF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#07111F',
    fontSize: 20,
    fontWeight: '800',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#101D2E',
    borderRadius: 18,
    padding: 20,
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },

  statLabel: {
    color: '#8B9AAF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  levelCard: {
    backgroundColor: '#101D2E',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },

  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  levelLabel: {
    color: '#8B9AAF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },

  levelName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  levelXp: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  levelBar: {
    height: 8,
    backgroundColor: '#1D2B3D',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },

  levelFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  nextLevelText: {
    color: '#8B9AAF',
    fontSize: 12,
  },

  progressCard: {
    backgroundColor: '#101D2E',
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  progressTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },

  progressText: {
    color: '#8B9AAF',
    fontSize: 13,
  },

  progressPercent: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  progressBar: {
    height: 8,
    backgroundColor: '#1D2B3D',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 14,
  },

  navigationGrid: {
    marginBottom: 30,
  },

  navigationCard: {
    backgroundColor: '#101D2E',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  navigationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  navigationIconText: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: '900',
  },

  navigationTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },

  navigationDescription: {
    color: '#8B9AAF',
    fontSize: 12,
    lineHeight: 18,
  },

  badgesScroll: {
    marginBottom: 30,
  },

  badgeCard: {
    width: 170,
    backgroundColor: '#101D2E',
    borderRadius: 18,
    padding: 18,
    marginRight: 14,
  },

  lockedBadge: {
    opacity: 0.45,
  },

  badgeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  badgeIcon: {
    color: '#07111F',
    fontSize: 18,
    fontWeight: '900',
  },

  badgeName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  badgeDescription: {
    color: '#8B9AAF',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },

  badgeStatus: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  questCard: {
    backgroundColor: '#101D2E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  questTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  questLabel: {
    color: '#8B9AAF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  xp: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },

  questDescription: {
    color: '#AAB7C8',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },

  questButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  completedButton: {
    opacity: 0.55,
  },

  questButtonText: {
    color: '#07111F',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});