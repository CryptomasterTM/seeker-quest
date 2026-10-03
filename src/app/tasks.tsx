import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useMobileWallet } from '@wallet-ui/react-native-web3js';

const dailyTasks = [
  ['Explore Seeker', 'Read about the Seeker ecosystem', 50],
  ['Seeker Knowledge', 'Complete a Seeker quiz', 75],
  ['Discover Apps', 'Explore 3 Seeker ecosystem apps', 100],
  ['Wallet Ready', 'Connect your compatible wallet', 50],
  ['Daily Explorer', 'Open 5 sections of The Seeker', 40],
  ['Quest Hunter', 'Complete your Quest of the Day', 100],
  ['Game Time', 'Play 2 mini games', 75],
  ['Quiz Master', 'Answer 5 quiz questions', 100],
  ['Keep the Streak', 'Return and complete a daily task', 50],
  ['Community Scout', 'Explore the community section', 50],
  ['Seeker History', 'Read one Seeker learning card', 40],
  ['Ecosystem Hunter', 'Discover 5 ecosystem projects', 125],
  ['Level Up', 'Earn 300 XP today', 150],
  ['Combo Starter', 'Complete 3 different task types', 100],
  ['Speed Seeker', 'Finish 3 tasks in one session', 100],
  ['Knowledge Run', 'Complete 2 quizzes', 125],
  ['Game Grinder', 'Score 100 points in mini games', 100],
  ['Daily Champion', 'Complete 7 daily tasks', 250],
  ['Explorer Plus', 'Visit every main section', 100],
  ['Seeker Scholar', 'Complete 10 learning tasks', 300],
  ['Quest Runner', 'Complete 5 quests', 200],
  ['XP Hunter', 'Earn 500 XP today', 250],
  ['Streak Builder', 'Protect your daily streak', 100],
  ['Challenge Accepted', 'Complete today’s challenge', 200],
];

const oneTimeTasks = [
  ['First Connection', 'Connect your wallet for the first time', 500],
  ['Welcome Seeker', 'Complete your first quest', 300],
  ['First Game', 'Play your first mini game', 250],
  ['Quiz Rookie', 'Finish your first quiz', 250],
  ['Explorer', 'Visit all major Seeker sections', 500],
  ['Quest Collector', 'Complete 10 quests', 750],
  ['Game Player', 'Play 10 mini games', 500],
  ['Quiz Scholar', 'Answer 25 quiz questions', 750],
  ['Event Hunter', 'Join your first event', 500],
  ['Combo Master', 'Complete a daily combo', 1000],
  ['Level 5', 'Reach level 5', 1000],
  ['Seeker Veteran', 'Complete 50 tasks', 1500],
];

const XP_KEY = 'seeker_xp';
const TOTAL_TASKS_KEY = 'seeker_total_tasks';

export default function TasksScreen() {
  const { connect, account } = useMobileWallet();
  const [wallet, setWallet] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [onceDone, setOnceDone] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  const dayKey = `seeker_daily_${new Date().toISOString().slice(0, 10)}`;
  const comboKey = `seeker_combo_${new Date().toISOString().slice(0, 10)}`;

  useEffect(() => {
    (async () => {
      try {
        const w = await AsyncStorage.getItem('seeker_wallet');
        const d = JSON.parse((await AsyncStorage.getItem(dayKey)) || '[]');
        const o = JSON.parse((await AsyncStorage.getItem('seeker_one_time')) || '[]');
        const c = Number((await AsyncStorage.getItem(comboKey)) || '0');
        const savedXp = Number((await AsyncStorage.getItem(XP_KEY)) || '0');
        const savedTotal = Number((await AsyncStorage.getItem(TOTAL_TASKS_KEY)) || '0');

        setWallet(w);
        setDone(d);
        setOnceDone(o);
        setCombo(c);
        setXp(savedXp);
        setTotalTasks(savedTotal);
      } catch (error) {
        console.log('TASK LOAD ERROR:', error);
      }
    })();
  }, []);

  async function walletGate() {
    if (wallet) return true;

    const connectedAccount = await connect();
      const address = connectedAccount?.address?.toString() ?? null;

    if (!address) {
      Alert.alert(
        'Wallet required',
        'Connect a compatible Solana wallet before completing tasks.'
      );
      return false;
    }

    await AsyncStorage.setItem('seeker_wallet', address);
    setWallet(address);

    return true;
  }

  async function addProgress(reward: number) {
    const nextXp = xp + reward;
    const nextTotal = totalTasks + 1;

    setXp(nextXp);
    setTotalTasks(nextTotal);

    await AsyncStorage.setItem(XP_KEY, String(nextXp));
    await AsyncStorage.setItem(TOTAL_TASKS_KEY, String(nextTotal));
  }

  async function complete(id: string, reward: number, once = false) {
    if (!(await walletGate())) return;

    if (once ? onceDone.includes(id) : done.includes(id)) {
      return;
    }

    if (once) {
      const next = [...onceDone, id];

      setOnceDone(next);

      await AsyncStorage.setItem(
        'seeker_one_time',
        JSON.stringify(next)
      );
    } else {
      const next = [...done, id];
      const nextCombo = Math.min(5, combo + 1);

      setDone(next);
      setCombo(nextCombo);

      await AsyncStorage.setItem(
        dayKey,
        JSON.stringify(next)
      );

      await AsyncStorage.setItem(
        comboKey,
        String(nextCombo)
      );

      if (nextCombo === 5) {
        const comboBonus = 250;
        const finalXp = xp + reward + comboBonus;
        const finalTotal = totalTasks + 1;

        setXp(finalXp);
        setTotalTasks(finalTotal);

        await AsyncStorage.setItem(
          XP_KEY,
          String(finalXp)
        );

        await AsyncStorage.setItem(
          TOTAL_TASKS_KEY,
          String(finalTotal)
        );

        Alert.alert(
          'DAILY COMBO COMPLETE',
          `You earned +${reward} XP plus a +${comboBonus} XP combo bonus.`
        );

        return;
      }
    }

    await addProgress(reward);

    Alert.alert(
      'TASK COMPLETE',
      `+${reward} XP added to your Seeker progress.`
    );
  }

  const level = Math.floor(xp / 1000) + 1;
  const levelProgress = xp % 1000;
  const levelPercent = Math.min(100, Math.round((levelProgress / 1000) * 100));

  if (!wallet) {
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
    >
      <Text style={s.eyebrow}>THE SEEKER</Text>
      <Text style={s.title}>Task Center</Text>
      <Text style={s.sub}>
        Complete challenges, build XP and keep your streak alive.
      </Text>

      <View style={s.progressCard}>
        <View style={s.progressTop}>
          <View>
            <Text style={s.progressLabel}>CURRENT LEVEL</Text>
            <Text style={s.level}>LEVEL {level}</Text>
          </View>

          <View style={s.xpBox}>
            <Text style={s.xpNumber}>{xp}</Text>
            <Text style={s.xpLabel}>TOTAL XP</Text>
          </View>
        </View>

        <View style={s.levelTrack}>
          <View
            style={[
              s.levelFill,
              { width: `${levelPercent}%` },
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
            <Text style={s.comboLabel}>DAILY COMBO</Text>
            <Text style={s.comboTitle}>{combo}/5 ACTIVITIES</Text>
          </View>

          <Text style={s.comboEmoji}>
            {combo >= 5 ? '✓' : `${combo}`}
          </Text>
        </View>

        <View style={s.comboTrack}>
          <View
            style={[
              s.comboFill,
              { width: `${(combo / 5) * 100}%` },
            ]}
          />
        </View>

        <Text style={s.comboText}>
          {combo >= 5
            ? 'Combo complete. You earned the daily bonus.'
            : `Complete ${5 - combo} more ${5 - combo === 1 ? 'activity' : 'activities'} to unlock +250 XP.`}
        </Text>
      </View>

      <View style={s.quickStats}>
        <View style={s.quick}>
          <Text style={s.quickNumber}>{done.length}</Text>
          <Text style={s.quickLabel}>TODAY</Text>
        </View>

        <View style={s.quick}>
          <Text style={s.quickNumber}>{totalTasks}</Text>
          <Text style={s.quickLabel}>ALL TIME</Text>
        </View>

        <View style={s.quick}>
          <Text style={s.quickNumber}>{onceDone.length}</Text>
          <Text style={s.quickLabel}>MILESTONES</Text>
        </View>
      </View>

      <Section
        title={`DAILY TASKS • ${done.length}/${dailyTasks.length}`}
        reset="Resets every 24 hours"
      >
        {dailyTasks.map((t, i) => {
          const id = `d${i}`;
          const completed = done.includes(id);

          return (
            <Task
              key={id}
              title={t[0] as string}
              desc={t[1] as string}
              xp={t[2] as number}
              completed={completed}
              onPress={() =>
                complete(id, t[2] as number)
              }
            />
          );
        })}
      </Section>

      <Section
        title="ONE-TIME QUESTS"
        reset="Complete once. Keep forever."
      >
        {oneTimeTasks.map((t, i) => {
          const id = `o${i}`;
          const completed = onceDone.includes(id);

          return (
            <Task
              key={id}
              title={t[0] as string}
              desc={t[1] as string}
              xp={t[2] as number}
              completed={completed}
              onPress={() =>
                complete(id, t[2] as number, true)
              }
            />
          );
        })}
      </Section>

      <Pressable
        style={s.bigButton}
        onPress={() => router.push('/events' as any)}
      >
        <Text style={s.bigButtonText}>
          EXPLORE EVENTS →
        </Text>
      </Pressable>

      <View style={s.footer}>
        <Text style={s.footerTitle}>KEEP SEEKING</Text>
        <Text style={s.footerText}>
          Every quest completed moves your Seeker profile forward.
        </Text>
      </View>
    </ScrollView>
  );
}

function Locked({ onConnect }: { onConnect: () => void }) {
  return (
    <View style={s.locked}>
      <Text style={s.logo}>SKR</Text>

      <Text style={s.lockBrand}>THE SEEKER</Text>

      <Text style={s.lockTitle}>
        Your adventure starts with your wallet.
      </Text>

      <Text style={s.sub}>
        Connect a compatible Solana wallet to unlock quests,
        games, events, XP and rewards.
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
      <Text style={s.section}>{title}</Text>
      <Text style={s.reset}>{reset}</Text>
      {children}
    </View>
  );
}

function Task({
  title,
  desc,
  xp,
  completed,
  onPress,
}: {
  title: string;
  desc: string;
  xp: number;
  completed: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        s.task,
        completed && s.taskDone,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          s.dot,
          completed && s.dotDone,
        ]}
      >
        <Text style={s.dotText}>
          {completed ? '✓' : '→'}
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
        <Text style={s.xp}>
          {completed ? 'DONE' : `+${xp}`}
        </Text>
      </View>
    </Pressable>
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

  progressCard: {
    marginTop: 22,
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
    opacity: 0.55,
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




