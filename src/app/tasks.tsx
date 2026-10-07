import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useMobileWallet } from '@wallet-ui/react-native-web3js';

import {
  addXp,
  checkIn,
  getActivities,
  getCheckinState,
  getDailyXp,
  getGameStates,
  getLevel,
  getXp,
  recordActivity,
} from '../lib/seekerProgress';

type TaskDef = {
  id: string;
  title: string;
  desc: string;
  xp: number;
  check: (
    activities: Record<string, number>,
    xp: number,
    dailyXp: number
  ) => boolean;
  action?: () => void;
};

type SocialTask = {
  id: string;
  title: string;
  desc: string;
  xp: number;
  url: string;
};

const DAILY_POOL: TaskDef[] = [
  {
    id: 'd_wallet',
    title: 'Wallet Ready',
    desc: 'Connect your compatible Solana wallet',
    xp: 50,
    check: (a) => (a.wallet_connected || 0) > 0,
  },
  {
    id: 'd_game',
    title: 'Game Time',
    desc: 'Complete 2 mini games today',
    xp: 75,
    check: (a) => (a.game_completed || 0) >= 2,
  },
  {
    id: 'd_quiz',
    title: 'Quiz Master',
    desc: 'Complete a Seeker Quiz today',
    xp: 100,
    check: (a) => (a.quiz_completed || 0) >= 1,
  },
  {
    id: 'd_score',
    title: 'Game Grinder',
    desc: 'Score at least 100 points in a game',
    xp: 100,
    check: (a) => (a.score_100 || 0) > 0,
  },
  {
    id: 'd_xp',
    title: 'Level Up',
    desc: 'Earn 300 XP today',
    xp: 150,
    check: (_, __, dailyXp) => dailyXp >= 300,
  },
  {
    id: 'd_explorer',
    title: 'Daily Explorer',
    desc: 'Visit the Seeker discovery hub',
    xp: 40,
    check: (a) => (a.discover_visit || 0) > 0,
  },
  {
    id: 'd_memory',
    title: 'Memory Run',
    desc: 'Complete a Memory Match game',
    xp: 80,
    check: (a) => (a.game_memory || 0) > 0,
  },
  {
    id: 'd_sprint',
    title: 'Solana Sprint',
    desc: 'Complete a Solana Sprint challenge',
    xp: 80,
    check: (a) => (a.game_sprint || 0) > 0,
  },
  {
    id: 'd_reaction',
    title: 'Quick Reflex',
    desc: 'Complete a Reaction Rush game',
    xp: 80,
    check: (a) => (a.game_reaction || 0) > 0,
  },
  {
    id: 'd_coin',
    title: 'Coin Hunter',
    desc: 'Complete a Coin Rush game',
    xp: 80,
    check: (a) => (a.game_coin || 0) > 0,
  },
  {
    id: 'd_math',
    title: 'Math Blitz',
    desc: 'Complete a Math Blitz game',
    xp: 80,
    check: (a) => (a.game_math || 0) > 0,
  },
  {
    id: 'd_number',
    title: 'Number Hunt',
    desc: 'Complete a Number Hunt game',
    xp: 80,
    check: (a) => (a.game_number || 0) > 0,
  },
  {
    id: 'd_color',
    title: 'Color Pulse',
    desc: 'Complete a Color Pulse game',
    xp: 80,
    check: (a) => (a.game_color || 0) > 0,
  },
  {
    id: 'd_sequence',
    title: 'Sequence Recall',
    desc: 'Complete a Sequence Recall game',
    xp: 90,
    check: (a) => (a.game_sequence || 0) > 0,
  },
  {
    id: 'd_odd',
    title: 'Odd One Out',
    desc: 'Complete an Odd One Out game',
    xp: 80,
    check: (a) => (a.game_odd || 0) > 0,
  },
  {
    id: 'd_checkin',
    title: 'Daily Seeker',
    desc: 'Check in today and keep your streak alive',
    xp: 60,
    check: (a) => (a.daily_checkin || 0) > 0,
  },
];

const SOCIAL_TASKS: SocialTask[] = [
  {
    id: 'social_solana_discord',
    title: 'Join Solana Discord',
    desc: 'Open the official Solana Discord and confirm when done',
    xp: 150,
    url: 'https://discord.gg/solana',
  },
  {
    id: 'social_seeker_discord',
    title: 'Join Seeker Discord',
    desc: 'Open the Solana Mobile community Discord and confirm',
    xp: 150,
    url: 'https://discord.gg/solanamobile',
  },
  {
    id: 'social_solana_telegram',
    title: 'Join Solana Telegram',
    desc: 'Open the official Solana Telegram and confirm',
    xp: 150,
    url: 'https://t.me/solana',
  },
  {
    id: 'social_seeker_telegram',
    title: 'Join Seeker Telegram',
    desc: 'Open the Solana Mobile Telegram and confirm',
    xp: 150,
    url: 'https://t.me/solanamobile',
  },
  {
    id: 'social_solana_x',
    title: 'Follow Solana on X',
    desc: 'Open @solana on X and confirm when done',
    xp: 150,
    url: 'https://x.com/solana',
  },
  {
    id: 'social_seeker_x',
    title: 'Follow Seeker on X',
    desc: 'Open @solanamobile on X and confirm',
    xp: 150,
    url: 'https://x.com/solanamobile',
  },
];

const MILESTONE_TASKS: TaskDef[] = [
  {
    id: 'o_connection',
    title: 'First Connection',
    desc: 'Connect your wallet for the first time',
    xp: 500,
    check: (a) => (a.wallet_connected || 0) > 0,
  },
  {
    id: 'o_game',
    title: 'First Game',
    desc: 'Complete your first mini game',
    xp: 250,
    check: (a) => (a.game_completed || 0) >= 1,
  },
  {
    id: 'o_quiz',
    title: 'Quiz Rookie',
    desc: 'Finish your first Seeker Quiz',
    xp: 250,
    check: (a) => (a.quiz_completed || 0) >= 1,
  },
  {
    id: 'o_arcade',
    title: 'Arcade Rookie',
    desc: 'Complete 3 mini games',
    xp: 400,
    check: (a) => (a.game_completed || 0) >= 3,
  },
  {
    id: 'o_score',
    title: 'Score Hunter',
    desc: 'Score 100 points in a game',
    xp: 300,
    check: (a) => (a.score_100 || 0) > 0,
  },
  {
    id: 'o_memory',
    title: 'Memory Master',
    desc: 'Master a Memory Match run',
    xp: 350,
    check: (a) => (a.memory_mastered || 0) > 0,
  },
  {
    id: 'o_explorer',
    title: 'Explorer',
    desc: 'Visit the Seeker discovery hub',
    xp: 500,
    check: (a) => (a.discover_visit || 0) > 0,
  },
  {
    id: 'o_level',
    title: 'Level 5',
    desc: 'Reach Seeker Level 5',
    xp: 1000,
    check: (_, xp) => getLevel(xp) >= 5,
  },
];

function dayKey() {
  const now = new Date();

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

function walletScope(wallet: string | null) {
  return (wallet || 'guest').toLowerCase();
}

function dailyDoneKey(wallet: string | null) {
  return `seeker_task_claimed_${walletScope(wallet)}_${dayKey()}`;
}

function onceDoneKey(wallet: string | null) {
  return `seeker_task_claimed_once_${walletScope(wallet)}`;
}

function socialDoneKey(wallet: string | null) {
  return `seeker_social_task_claimed_${walletScope(wallet)}`;
}

function comboKey(wallet: string | null) {
  return `seeker_task_combo_${walletScope(wallet)}_${dayKey()}`;
}

function totalKey(wallet: string | null) {
  return `seeker_total_tasks_${walletScope(wallet)}`;
}
async function readList(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeList(
  key: string,
  value: string[]
) {
  await AsyncStorage.setItem(
    key,
    JSON.stringify(value)
  );
}

function seededShuffle<T>(
  items: T[],
  seed: string
): T[] {
  let value = 0;

  for (const char of seed) {
    value =
      (value * 31 +
        char.charCodeAt(0)) >>>
      0;
  }

  const result = [...items];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    value =
      (value * 1664525 + 1013904223) >>>
      0;

    const j = value % (i + 1);

    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

function getTodaysTasks(): TaskDef[] {
  const walletTask = DAILY_POOL.find(
    (task) => task.id === 'd_wallet'
  );

  const checkinTask = DAILY_POOL.find(
    (task) => task.id === 'd_checkin'
  );

  const remaining = DAILY_POOL.filter(
    (task) =>
      task.id !== 'd_wallet' &&
      task.id !== 'd_checkin'
  );

  const shuffled = seededShuffle(
    remaining,
    dayKey()
  );

  const selected = shuffled.slice(0, 5);

  const dayNumber =
    Number(
      dayKey().replace(/-/g, '')
    ) || 0;

  const includeCheckin =
    dayNumber % 2 === 0;

  return [
    ...(walletTask ? [walletTask] : []),
    ...(includeCheckin && checkinTask
      ? [checkinTask]
      : []),
    ...selected,
  ];
}

export default function TasksScreen() {
  const { connect, account } =
    useMobileWallet();

  const [wallet, setWallet] =
    useState<string | null>(null);

  const [activities, setActivities] =
    useState<Record<string, number>>({});

  const [dailyTasks, setDailyTasks] =
    useState<TaskDef[]>([]);

  const [dailyDone, setDailyDone] =
    useState<string[]>([]);

  const [onceDone, setOnceDone] =
    useState<string[]>([]);

  const [socialDone, setSocialDone] =
    useState<string[]>([]);

  const [combo, setCombo] =
    useState(0);

  const [xp, setXp] =
    useState(0);

  const [dailyXp, setDailyXp] =
    useState(0);

  const [totalTasks, setTotalTasks] =
    useState(0);

  const [checkinStreak, setCheckinStreak] =
    useState(0);

  const [totalCheckins, setTotalCheckins] =
    useState(0);

  const [longestStreak, setLongestStreak] =
    useState(0);

  const [checkedInToday, setCheckedInToday] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const todaysTasks = getTodaysTasks();

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const savedWallet =
        await AsyncStorage.getItem(
          'seeker_wallet'
        );

      const liveWallet =
        account?.address?.toString() ??
        null;

      const currentWallet =
        liveWallet || savedWallet;

      if (
        liveWallet &&
        liveWallet !== savedWallet
      ) {
        await AsyncStorage.setItem(
          'seeker_wallet',
          liveWallet
        );
      }

      setWallet(currentWallet);

      const [
        currentActivities,
        currentXp,
        currentDailyXp,
        claimedDaily,
        claimedOnce,
        claimedSocial,
        savedCombo,
        savedTotal,
        checkinState,
      ] = await Promise.all([
        getActivities(),
        getXp(),
        getDailyXp(),
        readList(dailyDoneKey(currentWallet)),
        readList(onceDoneKey(currentWallet)),
        readList(socialDoneKey(currentWallet)),
        AsyncStorage.getItem(
          comboKey(currentWallet)
        ),
        AsyncStorage.getItem(
          totalKey(currentWallet)
        ),
        getCheckinState(),
      ]);

      setActivities(currentActivities);
      setDailyTasks(todaysTasks);
      setXp(currentXp);
      setDailyXp(currentDailyXp);
      setDailyDone(claimedDaily);
      setOnceDone(claimedOnce);
      setSocialDone(claimedSocial);
      setCombo(
        Number(savedCombo || '0')
      );
      setTotalTasks(
        Number(savedTotal || '0')
      );

      setCheckinStreak(
        checkinState.currentStreak
      );

      setTotalCheckins(
        checkinState.totalCheckins
      );

      setLongestStreak(
        checkinState.longestStreak
      );

      setCheckedInToday(
        checkinState.lastCheckinDate ===
          dayKey()
      );

      const nextDaily = [
        ...claimedDaily,
      ];

      const nextOnce = [
        ...claimedOnce,
      ];

      let earned = 0;
      let newlyCompletedDaily = 0;
      let newlyCompletedOnce = 0;

      for (const task of todaysTasks) {
        if (
          !nextDaily.includes(task.id) &&
          task.check(
            currentActivities,
            currentXp,
            currentDailyXp
          )
        ) {
          nextDaily.push(task.id);
          earned += task.xp;
          newlyCompletedDaily += 1;
        }
      }

      /*
       * One-time gameplay milestones.
       *
       * These are based on today's activity for now.
       * Once the activity is performed, the task ID is
       * permanently stored in ONCE_DONE_KEY.
       */
      for (const task of MILESTONE_TASKS) {
        if (
          !nextOnce.includes(task.id) &&
          task.check(
            currentActivities,
            currentXp,
            currentDailyXp
          )
        ) {
          nextOnce.push(task.id);
          earned += task.xp;
          newlyCompletedOnce += 1;
        }
      }

      const newlyCompleted =
        newlyCompletedDaily +
        newlyCompletedOnce;

      if (newlyCompleted > 0) {
        const newTotal =
          Number(savedTotal || '0') +
          newlyCompleted;

        await writeList(
          dailyDoneKey(currentWallet),
          nextDaily
        );

        await writeList(
          onceDoneKey(currentWallet),
          nextOnce
        );

        await AsyncStorage.setItem(
          totalKey(currentWallet),
          String(newTotal)
        );

        let finalXp = currentXp;

        if (earned > 0) {
          finalXp = await addXp(earned);
        }

        /*
         * Daily combo only counts today's
         * rotating daily tasks.
         */
        const nextCombo = Math.min(
          5,
          Number(savedCombo || '0') +
            newlyCompletedDaily
        );

        await AsyncStorage.setItem(
          comboKey(currentWallet),
          String(nextCombo)
        );

        if (
          nextCombo >= 5 &&
          Number(savedCombo || '0') < 5
        ) {
          await addXp(250);

          await recordActivity(
            'combo_completed'
          );

          Alert.alert(
            'DAILY COMBO COMPLETE',
            'You completed 5 daily activities and earned +250 XP.'
          );

          finalXp += 250;
        }

        setDailyDone(nextDaily);
        setOnceDone(nextOnce);
        setCombo(nextCombo);
        setTotalTasks(newTotal);
        setXp(finalXp);

        const refreshedDailyXp =
          await getDailyXp();

        setDailyXp(
          refreshedDailyXp
        );

        if (earned > 0) {
          Alert.alert(
            'TASKS COMPLETED',
            `You unlocked ${newlyCompleted} task${
              newlyCompleted === 1
                ? ''
                : 's'
            } and earned +${earned} XP.`
          );
        }
      }
    } catch (error) {
      console.log(
        'TASK LOAD ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, [
    account?.address,
    todaysTasks,
  ]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function walletGate() {
    if (wallet) {
      return true;
    }

    try {
      const connected =
        await connect();

      const address =
        connected?.address?.toString() ??
        null;

      if (!address) {
        Alert.alert(
          'Wallet required',
          'Connect a compatible Solana wallet before completing Seeker activities.'
        );

        return false;
      }

      await AsyncStorage.setItem(
        'seeker_wallet',
        address
      );

      await recordActivity(
        'wallet_connected'
      );

      setWallet(address);

      await load();

      return true;
    } catch (error) {
      console.log(
        'TASK WALLET ERROR:',
        error
      );

      Alert.alert(
        'Wallet connection failed',
        'We could not connect your wallet.'
      );

      return false;
    }
  }

  async function handleCheckIn() {
    if (!(await walletGate())) {
      return;
    }

    if (checkedInToday) {
      Alert.alert(
        'Already checked in',
        `You're already checked in today. Current streak: ${checkinStreak} days.`
      );

      return;
    }

    try {
      const result =
        await checkIn();

      if (
        result.alreadyCheckedIn
      ) {
        setCheckedInToday(true);

        Alert.alert(
          'Already checked in',
          'Your daily check-in is already complete.'
        );

        return;
      }

      setCheckedInToday(true);
      setCheckinStreak(
        result.state.currentStreak
      );
      setTotalCheckins(
        result.state.totalCheckins
      );
      setLongestStreak(
        result.state.longestStreak
      );
      setXp(result.xp);

      const refreshedActivities =
        await getActivities();

      setActivities(
        refreshedActivities
      );

      const refreshedDailyXp =
        await getDailyXp();

      setDailyXp(
        refreshedDailyXp
      );

      Alert.alert(
        'CHECK-IN COMPLETE 🔥',
        `${result.state.currentStreak} day streak!\n\n+${Math.min(
          50 +
            Math.max(
              0,
              result.state.currentStreak -
                1
            ) *
              5,
          100
        )} XP earned.\n\nTotal check-ins: ${result.state.totalCheckins}`
      );

      await load();
    } catch (error) {
      console.log(
        'CHECK-IN ERROR:',
        error
      );

      Alert.alert(
        'Check-in failed',
        'We could not save your check-in. Please try again.'
      );
    }
  }

  async function handleSocialTask(
    task: SocialTask
  ) {
    if (!(await walletGate())) {
      return;
    }

    if (
      socialDone.includes(task.id)
    ) {
      Alert.alert(
        'Already completed',
        'This one-time task is already complete.'
      );

      return;
    }

    try {
      await Linking.openURL(
        task.url
      );

      Alert.alert(
        task.title,
        'Complete the activity on the official page, then return here and confirm.',
        [
          {
            text: 'Not Yet',
            style: 'cancel',
          },
          {
            text: 'CONFIRM',
            onPress: async () => {
              try {
                const next = [
                  ...socialDone,
                  task.id,
                ];

                await writeList(
                  socialDoneKey(wallet),
                  next
                );

                await addXp(
                  task.xp
                );

                await recordActivity(
                  'social_task_completed'
                );

                await AsyncStorage.setItem(
                  totalKey(wallet),
                  String(
                    totalTasks + 1
                  )
                );

                setSocialDone(next);
                setTotalTasks(
                  totalTasks + 1
                );

                setXp(
                  await getXp()
                );

                setDailyXp(
                  await getDailyXp()
                );

                Alert.alert(
                  'TASK COMPLETED',
                  `${task.title}\n\n+${task.xp} XP`
                );
              } catch (error) {
                console.log(
                  'SOCIAL TASK ERROR:',
                  error
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        'SOCIAL LINK ERROR:',
        error
      );

      Alert.alert(
        'Could not open link',
        'Please try opening the official page again.'
      );
    }
  }

  const level = getLevel(xp);

  const levelProgress =
    xp % 1000;

  const levelPercent = Math.min(
    100,
    Math.round(
      (levelProgress / 1000) *
        100
    )
  );

  const dailyCompleted =
    dailyDone.filter((id) =>
      todaysTasks.some(
        (task) => task.id === id
      )
    ).length;

  const onceCompleted =
    onceDone.length;

  const socialCompleted =
    socialDone.length;

  if (!wallet && !loading) {
    return (
      <Locked
        onConnect={async () => {
          await walletGate();
        }}
      />
    );
  }

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    ><View nativeID="SEEKER_BACK_HOME_TASKS" style={{ marginBottom: 4 }}>
  <Pressable
    onPress={() => router.replace('/home')}
    style={{
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 2,
      marginBottom: 8,
    }}
  >
    <Text style={{ color: '#7F8DA8', fontSize: 13, fontWeight: '800' }}>
      ← Back Home
    </Text>
  </Pressable>
</View>

      <Text style={s.eyebrow}>
        THE SEEKER
      </Text>

      <Text style={s.title}>
        Task Center
      </Text>

      <Text style={s.sub}>
        New challenges every day. Real activities,
        real progress and permanent milestones.
      </Text>

      <View style={s.checkinCard}>
        <View style={s.checkinTop}>
          <View style={s.checkinIcon}>
            <Text style={s.checkinIconText}>
              🔥
            </Text>
          </View>

          <View style={s.checkinInfo}>
            <Text style={s.checkinLabel}>
              DAILY CHECK-IN
            </Text>

            <Text style={s.checkinTitle}>
              {checkedInToday
                ? `${checkinStreak} DAY STREAK`
                : 'CHECK IN TODAY'}
            </Text>

            <Text style={s.checkinDesc}>
              {checkedInToday
                ? 'You are checked in. Come back tomorrow to keep your streak alive.'
                : 'Check in once every day to build your streak and earn XP.'}
            </Text>
          </View>
        </View>

        <View style={s.checkinStats}>
          <View>
            <Text style={s.checkinStatNumber}>
              {checkinStreak}
            </Text>

            <Text style={s.checkinStatLabel}>
              CURRENT
            </Text>
          </View>

          <View>
            <Text style={s.checkinStatNumber}>
              {totalCheckins}
            </Text>

            <Text style={s.checkinStatLabel}>
              TOTAL
            </Text>
          </View>

          <View>
            <Text style={s.checkinStatNumber}>
              {longestStreak}
            </Text>

            <Text style={s.checkinStatLabel}>
              BEST
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            s.checkinButton,
            checkedInToday &&
              s.checkinButtonDone,
          ]}
          onPress={handleCheckIn}
        >
          <Text
            style={s.checkinButtonText}
          >
            {checkedInToday
              ? '✓ CHECKED IN TODAY'
              : 'CHECK IN + XP'}
          </Text>
        </Pressable>
      </View>

      <View style={s.progressCard}>
        <View style={s.progressTop}>
          <View>
            <Text style={s.progressLabel}>
              CURRENT LEVEL
            </Text>

            <Text style={s.level}>
              LEVEL {level}
            </Text>
          </View>

          <View style={s.xpBox}>
            <Text style={s.xpNumber}>
              {xp}
            </Text>

            <Text style={s.xpLabel}>
              TOTAL XP
            </Text>
          </View>
        </View>

        <View style={s.levelTrack}>
          <View
            style={[
              s.levelFill,
              {
                width: `${levelPercent}%`,
              },
            ]}
          />
        </View>

        <View style={s.progressBottom}>
          <Text style={s.progressSmall}>
            {levelProgress} / 1000 XP
          </Text>

          <Text style={s.progressSmall}>
            {1000 - levelProgress} XP to next level
          </Text>
        </View>
      </View>

      <View style={s.combo}>
        <View style={s.comboTop}>
          <View>
            <Text style={s.comboLabel}>
              DAILY COMBO
            </Text>

            <Text style={s.comboTitle}>
              {Math.min(combo, 5)}/5 ACTIVITIES
            </Text>
          </View>

          <Text style={s.comboEmoji}>
            {combo >= 5 ? '✓' : combo}
          </Text>
        </View>

        <View style={s.comboTrack}>
          <View
            style={[
              s.comboFill,
              {
                width: `${Math.min(
                  100,
                  (combo / 5) * 100
                )}%`,
              },
            ]}
          />
        </View>

        <Text style={s.comboText}>
          {combo >= 5
            ? 'Combo complete. Daily bonus unlocked.'
            : `Complete ${
                5 - Math.min(combo, 5)
              } more daily tasks to unlock +250 XP.`}
        </Text>
      </View>

      <View style={s.quickStats}>
        <View style={s.quick}>
          <Text style={s.quickNumber}>
            {dailyCompleted}
          </Text>

          <Text style={s.quickLabel}>
            TODAY
          </Text>
        </View>

        <View style={s.quick}>
          <Text style={s.quickNumber}>
            {totalTasks}
          </Text>

          <Text style={s.quickLabel}>
            ALL TIME
          </Text>
        </View>

        <View style={s.quick}>
          <Text style={s.quickNumber}>
            {onceCompleted +
              socialCompleted}
          </Text>

          <Text style={s.quickLabel}>
            MILESTONES
          </Text>
        </View>
      </View>

      <View style={s.liveCard}>
        <View>
          <Text style={s.liveLabel}>
            TODAY'S XP
          </Text>

          <Text style={s.liveXp}>
            +{dailyXp} XP
          </Text>
        </View>

        <View style={s.liveBadge}>
          <Text style={s.liveBadgeText}>
            LIVE
          </Text>
        </View>
      </View>

      <Section
        title={`TODAY'S TASKS • ${dailyCompleted}/${todaysTasks.length}`}
        reset="A fresh task set is generated automatically every day"
      >
        {todaysTasks.map((task) => {
          const completed =
            dailyDone.includes(
              task.id
            );

          return (
            <Task
              key={task.id}
              title={task.title}
              desc={task.desc}
              xp={task.xp}
              completed={completed}
            />
          );
        })}
      </Section>

      <Section
        title={`COMMUNITY MISSIONS • ${socialCompleted}/${SOCIAL_TASKS.length}`}
        reset="One-time activities • open, complete, then confirm"
      >
        {SOCIAL_TASKS.map(
          (task) => {
            const completed =
              socialDone.includes(
                task.id
              );

            return (
              <Pressable
                key={task.id}
                style={[
                  s.task,
                  completed &&
                    s.taskDone,
                ]}
                disabled={completed}
                onPress={() =>
                  handleSocialTask(
                    task
                  )
                }
              >
                <View
                  style={[
                    s.dot,
                    completed &&
                      s.dotDone,
                  ]}
                >
                  <Text
                    style={s.dotText}
                  >
                    {completed
                      ? '✓'
                      : '↗'}
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
                    style={s.taskDesc}
                  >
                    {task.desc}
                  </Text>
                </View>

                <View
                  style={s.taskReward}
                >
                  <Text
                    style={[
                      s.xp,
                      completed &&
                        s.doneText,
                    ]}
                  >
                    {completed
                      ? 'DONE'
                      : `+${task.xp}`}
                  </Text>
                </View>
              </Pressable>
            );
          }
        )}
      </Section>

      <Section
        title={`ONE-TIME MILESTONES • ${onceCompleted}/${MILESTONE_TASKS.length}`}
        reset="Complete once. Keep forever."
      >
        {MILESTONE_TASKS.map(
          (task) => {
            const completed =
              onceDone.includes(
                task.id
              );

            return (
              <Task
                key={task.id}
                title={task.title}
                desc={task.desc}
                xp={task.xp}
                completed={completed}
              />
            );
          }
        )}
      </Section>

      <Pressable
        style={s.bigButton}
        onPress={() =>
          router.push(
            '/events' as any
          )
        }
      >
        <Text
          style={s.bigButtonText}
        >
          EXPLORE EVENTS →
        </Text>
      </Pressable>

      <View style={s.footer}>
        <Text style={s.footerTitle}>
          KEEP SEEKING
        </Text>

        <Text style={s.footerText}>
          Every real activity moves your Seeker profile forward.
        </Text>
      </View>
    </ScrollView>
  );
}

function Locked({
  onConnect,
}: {
  onConnect: () => void;
}) {
  return (
    <View style={s.locked}>
      <Text style={s.logo}>
        SKR
      </Text>

      <Text style={s.lockBrand}>
        THE SEEKER
      </Text>

      <Text style={s.lockTitle}>
        Your adventure starts with your wallet.
      </Text>

      <Text style={s.sub}>
        Connect a compatible Solana wallet to unlock
        quests, games, events, XP and rewards.
      </Text>

      <Pressable
        style={s.connect}
        onPress={onConnect}
      >
        <Text style={s.connectText}>
          CONNECT WALLET
        </Text>
      </Pressable>
    </View>
  );
}

function Section({
  title,
  reset,
  children,
}: {
  title: string;
  reset: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.sectionWrap}>
      <Text style={s.section}>
        {title}
      </Text>

      <Text style={s.reset}>
        {reset}
      </Text>

      {children}
    </View>
  );
}

function Task({
  title,
  desc,
  xp,
  completed,
}: {
  title: string;
  desc: string;
  xp: number;
  completed: boolean;
}) {
  return (
    <View
      style={[
        s.task,
        completed &&
          s.taskDone,
      ]}
    >
      <View
        style={[
          s.dot,
          completed &&
            s.dotDone,
        ]}
      >
        <Text style={s.dotText}>
          {completed
            ? '✓'
            : '•'}
        </Text>
      </View>

      <View style={s.taskBody}>
        <Text style={s.taskTitle}>
          {title}
        </Text>

        <Text style={s.taskDesc}>
          {desc}
        </Text>
      </View>

      <View style={s.taskReward}>
        <Text
          style={[
            s.xp,
            completed &&
              s.doneText,
          ]}
        >
          {completed
            ? 'DONE'
            : `+${xp}`}
        </Text>
      </View>
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
    paddingBottom: 60,
  },

  eyebrow: {
    color: '#39a8ff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 18,
  },

  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },

  sub: {
    color: '#8f9bb7',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  checkinCard: {
    marginTop: 20,
    padding: 19,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3658a8',
    backgroundColor: '#101a38',
  },

  checkinTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkinIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#1b2853',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  checkinIconText: {
    fontSize: 25,
  },

  checkinInfo: {
    flex: 1,
  },

  checkinLabel: {
    color: '#7f93ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  checkinTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },

  checkinDesc: {
    color: '#8290ad',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  checkinStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#202e50',
  },

  checkinStatNumber: {
    color: '#61c4ff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },

  checkinStatLabel: {
    color: '#647493',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 3,
    textAlign: 'center',
  },

  checkinButton: {
    marginTop: 17,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#176cff',
    alignItems: 'center',
  },

  checkinButtonDone: {
    backgroundColor: '#123c46',
  },

  checkinButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  progressCard: {
    marginTop: 15,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#244c82',
    backgroundColor: '#0c152b',
  },

  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressLabel: {
    color: '#657895',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  level: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },

  xpBox: {
    alignItems: 'flex-end',
  },

  xpNumber: {
    color: '#55c1ff',
    fontSize: 23,
    fontWeight: '900',
  },

  xpLabel: {
    color: '#657895',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  levelTrack: {
    height: 8,
    backgroundColor: '#17223b',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 18,
  },

  levelFill: {
    height: '100%',
    backgroundColor: '#2684ff',
    borderRadius: 10,
  },

  progressBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  progressSmall: {
    color: '#657895',
    fontSize: 10,
  },

  combo: {
    marginTop: 15,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#315bff',
    backgroundColor: '#101735',
  },

  comboTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  comboLabel: {
    color: '#8a8cff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  comboTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },

  comboEmoji: {
    color: '#61bfff',
    fontSize: 28,
    fontWeight: '900',
  },

  comboTrack: {
    height: 7,
    backgroundColor: '#1a2344',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  comboFill: {
    height: '100%',
    backgroundColor: '#6f7cff',
    borderRadius: 10,
  },

  comboText: {
    color: '#9ca9c8',
    marginTop: 8,
    lineHeight: 19,
    fontSize: 12,
  },

  quickStats: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 15,
  },

  quick: {
    flex: 1,
    backgroundColor: '#0b1121',
    borderWidth: 1,
    borderColor: '#1b2945',
    borderRadius: 16,
    padding: 13,
  },

  quickNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },

  quickLabel: {
    color: '#63718c',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },

  liveCard: {
    marginTop: 15,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#09172a',
    borderWidth: 1,
    borderColor: '#174b70',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  liveLabel: {
    color: '#66819e',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  liveXp: {
    color: '#55d8ff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },

  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#103a46',
  },

  liveBadgeText: {
    color: '#55d8ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionWrap: {
    marginTop: 27,
  },

  section: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
  },

  reset: {
    color: '#65718d',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 10,
  },

  task: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#1b2945',
    marginBottom: 9,
  },

  taskDone: {
    opacity: 0.68,
    borderColor: '#164f55',
  },

  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#172a52',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  dotDone: {
    backgroundColor: '#164b4e',
  },

  dotText: {
    color: '#55b7ff',
    fontWeight: '900',
    fontSize: 15,
  },

  taskBody: {
    flex: 1,
  },

  taskTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  taskDesc: {
    color: '#77849f',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  taskReward: {
    marginLeft: 8,
  },

  xp: {
    color: '#56d8ff',
    fontWeight: '900',
    fontSize: 11,
  },

  doneText: {
    color: '#58d7b0',
  },

  bigButton: {
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#176cff',
    alignItems: 'center',
  },

  bigButtonText: {
    color: '#fff',
    fontWeight: '900',
  },

  footer: {
    alignItems: 'center',
    paddingTop: 28,
  },

  footerTitle: {
    color: '#52627e',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footerText: {
    color: '#3f4d66',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },

  locked: {
    flex: 1,
    backgroundColor: '#050814',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },

  logo: {
    fontSize: 64,
    fontWeight: '900',
    color: '#42a5ff',
    letterSpacing: 4,
  },

  lockBrand: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 5,
  },

  lockTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 25,
  },

  connect: {
    marginTop: 28,
    paddingHorizontal: 35,
    paddingVertical: 17,
    borderRadius: 18,
    backgroundColor: '#176cff',
  },

  connectText: {
    color: '#fff',
    fontWeight: '900',
  },
});





