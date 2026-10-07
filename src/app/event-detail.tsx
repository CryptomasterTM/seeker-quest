import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  EVENTS,
  EventItem,
} from './events';
import {
  EventProgress,
  claimEventReward,
  completeEventTask,
  getEventProgress,
  joinEvent,
} from '../lib/seekerProgress';

type Section =
  | 'home'
  | 'tasks'
  | 'progress'
  | 'leaderboard'
  | 'rewards';

type EventTask = {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
};

const EVENT_TASKS: EventTask[] = [
  {
    id: 'event-first-step',
    title: 'Enter the Event',
    description:
      'Join this event and start your event journey.',
    xp: 50,
    icon: '⚡',
  },
  {
    id: 'event-play-game',
    title: 'Play a Game',
    description:
      'Complete one game while participating in the event.',
    xp: 100,
    icon: '🎮',
  },
  {
    id: 'event-complete-quest',
    title: 'Complete an Event Quest',
    description:
      'Finish one qualifying event activity.',
    xp: 150,
    icon: '◆',
  },
  {
    id: 'event-earn-xp',
    title: 'Reach 500 Event XP',
    description:
      'Earn enough event XP from your activities.',
    xp: 200,
    icon: '✦',
  },
];

const BASE_LEADERBOARD = [
  {
    rank: 1,
    name: 'Seeker Prime',
    xp: 2450,
  },
  {
    rank: 2,
    name: 'Nova',
    xp: 2180,
  },
  {
    rank: 3,
    name: 'Orbit',
    xp: 1940,
  },
  {
    rank: 4,
    name: 'Cryptomaster',
    xp: 0,
  },
];

export default function EventDetailScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
      section?: string;
    }>();

  const eventId = String(
    params.id ?? EVENTS[0]?.id ?? '',
  );

  const event = useMemo<EventItem | undefined>(
    () =>
      EVENTS.find(
        (item) => item.id === eventId,
      ) ?? EVENTS[0],
    [eventId],
  );

  const initialSection: Section =
    params.section === 'leaderboard'
      ? 'leaderboard'
      : 'home';

  const [section, setSection] =
    useState<Section>(initialSection);

  const [progress, setProgress] =
    useState<EventProgress | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const saved =
        await getEventProgress(eventId);

      if (mounted) {
        setProgress(saved);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  async function refresh() {
    const saved =
      await getEventProgress(eventId);

    setProgress(saved);
  }

  async function handleJoin() {
    if (busy || !progress || progress.joined) {
      return;
    }

    setBusy(true);

    try {
      const next =
        await joinEvent(eventId);

      setProgress(next);
    } finally {
      setBusy(false);
    }
  }

  async function handleTask(task: EventTask) {
    if (
      busy ||
      !progress ||
      !progress.joined ||
      progress.completedTasks.includes(task.id)
    ) {
      return;
    }

    setBusy(true);

    try {
      const result =
        await completeEventTask(
          eventId,
          task.id,
          task.xp,
        );

      if (result.added) {
        setProgress(result.progress);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleReward(
    rewardId: string,
  ) {
    if (
      busy ||
      !progress ||
      progress.eventXp < 1000 ||
      progress.rewardsClaimed.includes(
        rewardId,
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      const result =
        await claimEventReward(
          eventId,
          rewardId,
        );

      setProgress(result.progress);
    } finally {
      setBusy(false);
    }
  }

  const eventXp =
    progress?.eventXp ?? 0;

  const completedTasks =
    progress?.completedTasks ?? [];

  const joined =
    progress?.joined ?? false;

  const progressPercent =
    Math.min(
      100,
      Math.round(
        (eventXp / 1000) * 100,
      ),
    );

  const taskCount =
    completedTasks.filter((id) =>
      EVENT_TASKS.some(
        (task) => task.id === id,
      ),
    ).length;

  function renderTabs() {
    const tabs: {
      id: Section;
      label: string;
    }[] = [
      {
        id: 'home',
        label: 'HOME',
      },
      {
        id: 'tasks',
        label: 'TASKS',
      },
      {
        id: 'progress',
        label: 'PROGRESS',
      },
      {
        id: 'leaderboard',
        label: 'RANKING',
      },
      {
        id: 'rewards',
        label: 'REWARDS',
      },
    ];

    return (
            <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabs}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              s.tab,
              section === tab.id &&
                s.tabActive,
            ]}
            onPress={() =>
              setSection(tab.id)
            }
          >
            <Text
              style={[
                s.tabText,
                section === tab.id &&
                  s.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  function renderHome() {
    return (
      <>
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Text
              style={s.heroIconText}
            >
              {event?.icon}
            </Text>
          </View>

          <Text style={s.status}>
            {event?.status}
          </Text>

          <Text style={s.heroTitle}>
            {event?.title}
          </Text>

          <Text
            style={s.heroDescription}
          >
            {event?.description}
          </Text>

          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text
                style={s.heroStatValue}
              >
                {event?.boost}
              </Text>

              <Text
                style={s.heroStatLabel}
              >
                XP BOOST
              </Text>
            </View>

            <View style={s.heroStat}>
              <Text
                style={s.heroStatValue}
              >
                {event?.reward}
              </Text>

              <Text
                style={s.heroStatLabel}
              >
                REWARD
              </Text>
            </View>

            <View style={s.heroStat}>
              <Text
                style={s.heroStatValue}
              >
                {event?.participants}
              </Text>

              <Text
                style={s.heroStatLabel}
              >
                PLAYERS
              </Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardEyebrow}>
            YOUR EVENT
          </Text>

          <Text style={s.cardTitle}>
            {joined
              ? 'You are in the event'
              : 'Ready to start seeking?'}
          </Text>

          <Text style={s.cardText}>
            {joined
              ? 'Complete event activities to earn event XP and climb the event ranking.'
              : 'Join this event to unlock its tasks, progress and rewards.'}
          </Text>

          <Pressable
            style={[
              s.primaryButton,
              joined &&
                s.primaryButtonJoined,
            ]}
            disabled={joined || busy}
            onPress={handleJoin}
          >
            <Text
              style={s.primaryButtonText}
            >
              {joined
                ? 'EVENT JOINED'
                : busy
                  ? 'JOINING...'
                  : 'JOIN EVENT'}
            </Text>
          </Pressable>
        </View>

        <View style={s.card}>
          <View style={s.rowBetween}>
            <View>
              <Text
                style={s.cardEyebrow}
              >
                EVENT PROGRESS
              </Text>

              <Text
                style={s.bigNumber}
              >
                {eventXp} XP
              </Text>
            </View>

            <Text style={s.percent}>
              {progressPercent}%
            </Text>
          </View>

          <View
            style={s.progressTrack}
          >
            <View
              style={[
                s.progressFill,
                {
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>

          <Text
            style={s.progressText}
          >
            {taskCount} of{' '}
            {EVENT_TASKS.length}{' '}
            event tasks completed
          </Text>
        </View>

        <View style={s.quickGrid}>
          <Pressable
            style={s.quickCard}
            onPress={() =>
              setSection('tasks')
            }
          >
            <Text
              style={s.quickIcon}
            >
              ✓
            </Text>

            <Text
              style={s.quickTitle}
            >
              EVENT TASKS
            </Text>

            <Text
              style={s.quickText}
            >
              Earn event XP
            </Text>
          </Pressable>

          <Pressable
            style={s.quickCard}
            onPress={() =>
              setSection(
                'leaderboard',
              )
            }
          >
            <Text
              style={s.quickIcon}
            >
              🏆
            </Text>

            <Text
              style={s.quickTitle}
            >
              RANKING
            </Text>

            <Text
              style={s.quickText}
            >
              See the competition
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  function renderTasks() {
    return (
      <>
        <View style={s.sectionHeader}>
          <Text
            style={s.sectionTitle}
          >
            Event Tasks
          </Text>

          <Text
            style={s.sectionSubtitle}
          >
            Complete activities to earn
            event XP.
          </Text>
        </View>

        {EVENT_TASKS.map((task) => {
          const completed =
            completedTasks.includes(
              task.id,
            );

          const locked =
            !joined &&
            task.id !==
              'event-first-step';

          return (
            <View
              key={task.id}
              style={[
                s.taskCard,
                completed &&
                  s.taskCompleted,
              ]}
            >
              <View
                style={s.taskIcon}
              >
                <Text
                  style={
                    s.taskIconText
                  }
                >
                  {completed
                    ? '✓'
                    : task.icon}
                </Text>
              </View>

              <View
                style={s.taskBody}
              >
                <Text
                  style={s.taskTitle}
                >
                  {task.title}
                </Text>

                <Text
                  style={
                    s.taskDescription
                  }
                >
                  {task.description}
                </Text>

                <Text
                  style={s.taskXp}
                >
                  +{task.xp} EVENT XP
                </Text>
              </View>

              <Pressable
                style={[
                  s.taskButton,
                  completed &&
                    s.taskButtonCompleted,
                  locked &&
                    s.taskButtonLocked,
                ]}
                disabled={
                  completed ||
                  locked ||
                  busy
                }
                onPress={() =>
                  task.id ===
                  'event-first-step'
                    ? handleJoin()
                    : handleTask(task)
                }
              >
                <Text
                  style={[
                    s.taskButtonText,
                    completed &&
                      s.taskButtonTextCompleted,
                  ]}
                >
                  {completed
                    ? 'DONE'
                    : locked
                      ? 'LOCKED'
                      : 'START'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </>
    );
  }

  function renderProgress() {
    return (
      <>
        <View style={s.sectionHeader}>
          <Text
            style={s.sectionTitle}
          >
            Your Progress
          </Text>

          <Text
            style={s.sectionSubtitle}
          >
            Your progress inside this
            event only.
          </Text>
        </View>

        <View
          style={s.progressHero}
        >
          <Text
            style={
              s.progressHeroLabel
            }
          >
            EVENT XP
          </Text>

          <Text
            style={
              s.progressHeroNumber
            }
          >
            {eventXp}
          </Text>

          <Text
            style={
              s.progressHeroTarget
            }
          >
            / 1000 XP
          </Text>

          <View
            style={
              s.progressTrackLarge
            }
          >
            <View
              style={[
                s.progressFill,
                {
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={s.metricGrid}>
          <View style={s.metric}>
            <Text
              style={s.metricNumber}
            >
              {taskCount}
            </Text>

            <Text
              style={s.metricLabel}
            >
              TASKS DONE
            </Text>
          </View>

          <View style={s.metric}>
            <Text
              style={s.metricNumber}
            >
              {eventXp}
            </Text>

            <Text
              style={s.metricLabel}
            >
              EVENT XP
            </Text>
          </View>
        </View>
      </>
    );
  }

  function renderLeaderboard() {
    const rows =
      BASE_LEADERBOARD.map(
        (row) =>
          row.name ===
          'Cryptomaster'
            ? {
                ...row,
                xp: eventXp,
              }
            : row,
      ).sort(
        (a, b) => b.xp - a.xp,
      );

    return (
      <>
        <View style={s.sectionHeader}>
          <Text
            style={s.sectionTitle}
          >
            Event Leaderboard
          </Text>

          <Text
            style={s.sectionSubtitle}
          >
            Only XP earned in this event
            counts here.
          </Text>
        </View>

        {rows.map(
          (row, index) => (
            <View
              key={row.name}
              style={[
                s.rankRow,
                row.name ===
                  'Cryptomaster' &&
                  s.rankRowYou,
              ]}
            >
              <Text
                style={s.rankNumber}
              >
                #{index + 1}
              </Text>

              <View
                style={s.rankAvatar}
              >
                <Text
                  style={
                    s.rankAvatarText
                  }
                >
                  {row.name.slice(
                    0,
                    1,
                  )}
                </Text>
              </View>

              <View
                style={s.rankBody}
              >
                <Text
                  style={s.rankName}
                >
                  {row.name}
                  {row.name ===
                    'Cryptomaster'
                    ? '  YOU'
                    : ''}
                </Text>

                <Text
                  style={s.rankXp}
                >
                  {row.xp} event XP
                </Text>
              </View>

              <Text
                style={s.rankMedal}
              >
                {index === 0
                  ? '🥇'
                  : index === 1
                    ? '🥈'
                    : index === 2
                      ? '🥉'
                      : ''}
              </Text>
            </View>
          ),
        )}
      </>
    );
  }

  function renderRewards() {
    const completed =
      eventXp >= 1000;

    const rewardClaimed =
      progress?.rewardsClaimed.includes(
        'event-completion',
      ) ?? false;

    return (
      <>
        <View style={s.sectionHeader}>
          <Text
            style={s.sectionTitle}
          >
            Event Rewards
          </Text>

          <Text
            style={s.sectionSubtitle}
          >
            Rewards are based on your
            event progress.
          </Text>
        </View>

        <View
          style={s.rewardCard}
        >
          <Text
            style={s.rewardIcon}
          >
            ✦
          </Text>

          <Text
            style={s.rewardTitle}
          >
            EVENT COMPLETION
          </Text>

          <Text
            style={s.rewardDescription}
          >
            Reach 1000 event XP to
            unlock the event completion
            reward.
          </Text>

          <View
            style={s.rewardProgress}
          >
            <View
              style={[
                s.progressFill,
                {
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>

          <Text
            style={[
              s.rewardStatus,
              completed &&
                s.rewardUnlocked,
            ]}
          >
            {rewardClaimed
              ? 'REWARD CLAIMED'
              : completed
                ? 'READY TO CLAIM'
                : `${Math.max(
                    0,
                    1000 - eventXp,
                  )} XP remaining`}
          </Text>

          {completed &&
            !rewardClaimed && (
              <Pressable
                style={
                  s.primaryButton
                }
                disabled={busy}
                onPress={() =>
                  handleReward(
                    'event-completion',
                  )
                }
              >
                <Text
                  style={
                    s.primaryButtonText
                  }
                >
                  CLAIM REWARD
                </Text>
              </Pressable>
            )}
        </View>

        <View
          style={s.rewardCard}
        >
          <Text
            style={s.rewardIcon}
          >
            🏅
          </Text>

          <Text
            style={s.rewardTitle}
          >
            EVENT BADGE
          </Text>

          <Text
            style={s.rewardDescription}
          >
            Complete the event requirements
            to qualify for its permanent
            badge.
          </Text>

          <Text
            style={[
              s.rewardStatus,
              completed &&
                s.rewardUnlocked,
            ]}
          >
            {completed
              ? 'QUALIFIED'
              : 'LOCKED'}
          </Text>
        </View>
      </>
    );
  }

  if (loading || !progress) {
    return (
      <View style={s.loading}>
        <Text style={s.loadingTitle}>
          LOADING EVENT
        </Text>

        <Text style={s.loadingText}>
          Preparing your event progress...
        </Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={s.loading}>
        <Text style={s.loadingTitle}>
          EVENT NOT FOUND
        </Text>

        <Pressable
          style={s.primaryButton}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={s.primaryButtonText}
          >
            GO BACK
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.page}>
            {/* BACK HOME BUTTON */}
      <TouchableOpacity
        onPress={() => router.replace('/home')}
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          marginBottom: 8,
          paddingVertical: 13,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#334155',
          backgroundColor: '#111827',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>
          ← Back Home
        </Text>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={
          s.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={s.topBar}>
          <Pressable
            style={s.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Text style={s.backText}>
              ‹
            </Text>
          </Pressable>

          <View>
            <Text
              style={s.topEyebrow}
            >
              THE SEEKER
            </Text>

            <Text
              style={s.topTitle}
            >
              EVENT CENTER
            </Text>
          </View>
        </View>

        {renderTabs()}

        {section === 'home' &&
          renderHome()}

        {section === 'tasks' &&
          renderTasks()}

        {section === 'progress' &&
          renderProgress()}

        {section === 'leaderboard' &&
          renderLeaderboard()}

        {section === 'rewards' &&
          renderRewards()}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#050814',
  },

  content: {
    padding: 20,
    paddingBottom: 70,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#0d1427',
    borderWidth: 1,
    borderColor: '#20345b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#fff',
    fontSize: 31,
    lineHeight: 31,
    marginTop: -3,
  },

  topEyebrow: {
    color: '#48b5ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  topTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },

  tabs: {
    gap: 7,
    paddingBottom: 17,
  },

  tab: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#0b1223',
    borderWidth: 1,
    borderColor: '#1d3155',
  },

  tabActive: {
    backgroundColor: '#176cff',
    borderColor: '#176cff',
  },

  tabText: {
    color: '#687895',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  tabTextActive: {
    color: '#fff',
  },

  hero: {
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#284475',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },

  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: '#142c56',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroIconText: {
    color: '#5bc6ff',
    fontSize: 31,
  },

  status: {
    color: '#49d2a7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 15,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 5,
  },

  heroDescription: {
    color: '#7e8ba5',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 9,
  },

  heroStats: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 19,
    gap: 8,
  },

  heroStat: {
    flex: 1,
    backgroundColor: '#080e1d',
    borderRadius: 13,
    padding: 10,
    alignItems: 'center',
  },

  heroStatValue: {
    color: '#62c5ff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },

  heroStatLabel: {
    color: '#596984',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#1f3459',
    borderRadius: 20,
    padding: 17,
    marginTop: 14,
  },

  cardEyebrow: {
    color: '#5a8fc5',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 5,
  },

  cardText: {
    color: '#7d8aa4',
    lineHeight: 19,
    marginTop: 7,
  },

  primaryButton: {
    backgroundColor: '#176cff',
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 15,
  },

  primaryButtonJoined: {
    backgroundColor: '#153a35',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  bigNumber: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 5,
  },

  percent: {
    color: '#5ec2ff',
    fontSize: 16,
    fontWeight: '900',
  },

  progressTrack: {
    height: 9,
    backgroundColor: '#17223a',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 13,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2580ff',
    borderRadius: 10,
  },

  progressText: {
    color: '#65748f',
    fontSize: 10,
    marginTop: 7,
  },

  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  quickCard: {
    flex: 1,
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#1f3459',
    borderRadius: 18,
    padding: 15,
  },

  quickIcon: {
    color: '#55bdff',
    fontSize: 21,
  },

  quickTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 10,
  },

  quickText: {
    color: '#667590',
    fontSize: 10,
    marginTop: 4,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#7c89a3',
    lineHeight: 19,
    marginTop: 5,
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#1e3359',
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
  },

  taskCompleted: {
    borderColor: '#236e63',
  },

  taskIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#14284b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  taskIconText: {
    fontSize: 19,
    color: '#59c5ff',
  },

  taskBody: {
    flex: 1,
  },

  taskTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },

  taskDescription: {
    color: '#687793',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  taskXp: {
    color: '#54c0ff',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 5,
  },

  taskButton: {
    backgroundColor: '#176cff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginLeft: 7,
  },

  taskButtonCompleted: {
    backgroundColor: '#153a35',
  },

  taskButtonLocked: {
    backgroundColor: '#151c2c',
  },

  taskButtonText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },

  taskButtonTextCompleted: {
    color: '#57d6b0',
  },

  progressHero: {
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#284475',
    borderRadius: 22,
    padding: 21,
    alignItems: 'center',
  },

  progressHeroLabel: {
    color: '#6480a8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  progressHeroNumber: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    marginTop: 3,
  },

  progressHeroTarget: {
    color: '#65738e',
    fontSize: 11,
    marginTop: -5,
  },

  progressTrackLarge: {
    width: '100%',
    height: 12,
    backgroundColor: '#18243d',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 18,
  },

  metricGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  metric: {
    flex: 1,
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#1f3459',
    borderRadius: 17,
    padding: 16,
  },

  metricNumber: {
    color: '#5fc3ff',
    fontSize: 24,
    fontWeight: '900',
  },

  metricLabel: {
    color: '#63718b',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 5,
  },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#1d3155',
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
  },

  rankRowYou: {
    borderColor: '#2767a5',
    backgroundColor: '#0d1930',
  },

  rankNumber: {
    color: '#65738c',
    width: 35,
    fontSize: 11,
    fontWeight: '900',
  },

  rankAvatar: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#193563',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  rankAvatarText: {
    color: '#66c7ff',
    fontWeight: '900',
  },

  rankBody: {
    flex: 1,
  },

  rankName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },

  rankXp: {
    color: '#687792',
    fontSize: 9,
    marginTop: 3,
  },

  rankMedal: {
    fontSize: 17,
  },

  rewardCard: {
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#283d68',
    borderRadius: 21,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },

  rewardIcon: {
    fontSize: 30,
    color: '#62c6ff',
  },

  rewardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 9,
  },

  rewardDescription: {
    color: '#77849d',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },

  rewardProgress: {
    width: '100%',
    height: 9,
    backgroundColor: '#17223a',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  rewardStatus: {
    color: '#65738e',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 10,
  },

  rewardUnlocked: {
    color: '#57d6b0',
  },

  loading: {
    flex: 1,
    backgroundColor: '#050814',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  loadingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },

  loadingText: {
    color: '#71809d',
    marginTop: 8,
  },
});


