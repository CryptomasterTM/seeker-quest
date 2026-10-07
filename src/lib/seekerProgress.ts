import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WALLET_KEY = 'seeker_wallet';

const XP_KEY = 'seeker_xp';
const DAILY_XP_PREFIX = 'seeker_daily_xp_';
const ACTIVITIES_PREFIX = 'seeker_activities_';
const BADGES_KEY = 'seeker_badges';
const GAME_PREFIX = 'seeker_game_';
export const CHECKIN_KEY = 'seeker_checkin_state';
const EVENT_PREFIX = 'seeker_event_progress_';

const DAY_MS = 24 * 60 * 60 * 1000;

export type ActivityMap = Record<string, number>;

export type GameState = {
  attempts: number;
  lastAttemptAt: number | null;
  bestScore: number;
  totalScore: number;
};

export type CheckinState = {
  currentStreak: number;
  totalCheckins: number;
  longestStreak: number;
  lastCheckinDate: string | null;
  lastCheckinAt: number | null;
};

export type EventProgress = {
  eventId: string;
  joined: boolean;
  eventXp: number;
  completedTasks: string[];
  rewardsClaimed: string[];
  joinedAt: number | null;
  completedAt: number | null;
};

const BADGES = [
  {
    id: 'wallet_ready',
    name: 'Wallet Ready',
    requirement: 'Connect your wallet',
  },
  {
    id: 'first_steps',
    name: 'First Steps',
    requirement: 'Complete your first task',
  },
  {
    id: 'arcade_rookie',
    name: 'Arcade Rookie',
    requirement: 'Complete your first game',
  },
  {
    id: 'quiz_ace',
    name: 'Quiz Ace',
    requirement: 'Score 80%+ on a quiz',
  },
  {
    id: 'memory_master',
    name: 'Memory Master',
    requirement: 'Complete Memory Match',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    requirement: 'Discover something new',
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    requirement: 'Complete a daily combo',
  },
  {
    id: 'level_5',
    name: 'Level 5',
    requirement: 'Reach level 5',
  },
  {
    id: 'event_runner',
    name: 'Event Runner',
    requirement: 'Complete event activities',
  },
  {
    id: 'seven_day',
    name: '7 Day Seeker',
    requirement: 'Reach a 7 day check-in streak',
  },
  {
    id: 'fourteen_day',
    name: '14 Day Seeker',
    requirement: 'Reach a 14 day check-in streak',
  },
  {
    id: 'thirty_day',
    name: '30 Day Seeker',
    requirement: 'Reach a 30 day check-in streak',
  },
] as const;

function getLocalDay(date = new Date()) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');
  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getYesterdayDay() {
  const yesterday = new Date(
    Date.now() - DAY_MS,
  );

  return getLocalDay(yesterday);
}

async function getWalletScope() {
  const wallet =
    await AsyncStorage.getItem(
      WALLET_KEY,
    );

  if (!wallet) {
    return 'guest';
  }

  return wallet
    .trim()
    .toLowerCase();
}

function scopedKey(
  key: string,
  wallet: string,
) {
  const safeWallet = wallet
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  return `${key}_${safeWallet}`;
}

async function readNumber(
  key: string,
  fallback = 0,
) {
  const wallet =
    await getWalletScope();

  const value =
    await AsyncStorage.getItem(
      scopedKey(key, wallet),
    );

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

async function writeNumber(
  key: string,
  value: number,
) {
  const wallet =
    await getWalletScope();

  await AsyncStorage.setItem(
    scopedKey(key, wallet),
    String(value),
  );
}

async function readList(
  key: string,
): Promise<string[]> {
  const wallet =
    await getWalletScope();

  const value =
    await AsyncStorage.getItem(
      scopedKey(key, wallet),
    );

  if (!value) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            typeof item ===
            'string',
        )
      : [];
  } catch {
    return [];
  }
}

async function writeList(
  key: string,
  value: string[],
) {
  const wallet =
    await getWalletScope();

  await AsyncStorage.setItem(
    scopedKey(key, wallet),
    JSON.stringify(value),
  );
}

async function readObject<T>(
  key: string,
  fallback: T,
): Promise<T> {
  const wallet =
    await getWalletScope();

  const value =
    await AsyncStorage.getItem(
      scopedKey(key, wallet),
    );

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function writeObject<T>(
  key: string,
  value: T,
) {
  const wallet =
    await getWalletScope();

  await AsyncStorage.setItem(
    scopedKey(key, wallet),
    JSON.stringify(value),
  );
}

export function getLevel(
  xp: number,
) {
  return Math.max(
    1,
    Math.floor(xp / 500) + 1,
  );
}

export function getLevelProgress(
  xp: number,
) {
  const level = getLevel(xp);
  const previous = (level - 1) * 500;
  const next = level * 500;

  return {
    level,
    current: xp - previous,
    required: next - previous,
    percent: Math.min(
      100,
      Math.round(
        ((xp - previous) /
          (next - previous)) *
          100,
      ),
    ),
  };
}

export async function getXp() {
  return readNumber(XP_KEY);
}

export async function addXp(
  amount: number,
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return getXp();
  }

  const current =
    await getXp();

  const next =
    current + Math.round(amount);

  await writeNumber(
    XP_KEY,
    next,
  );

  await unlockBadges();

  return next;
}

export async function getDailyXp() {
  return readNumber(
    `${DAILY_XP_PREFIX}${getLocalDay()}`,
  );
}

async function addDailyXp(
  amount: number,
) {
  const key =
    `${DAILY_XP_PREFIX}${getLocalDay()}`;

  const current =
    await readNumber(key);

  await writeNumber(
    key,
    current + amount,
  );
}

export async function getActivities(): Promise<ActivityMap> {
  return readObject<ActivityMap>(
    `${ACTIVITIES_PREFIX}${getLocalDay()}`,
    {},
  );
}

export async function recordActivity(
  activity: string,
  amount = 1,
) {
  const activities =
    await getActivities();

  activities[activity] =
    (activities[activity] ?? 0) +
    amount;

  await writeObject(
    `${ACTIVITIES_PREFIX}${getLocalDay()}`,
    activities,
  );

  return activities;
}

export async function setActivityMax(
  activity: string,
  value: number,
) {
  const activities =
    await getActivities();

  activities[activity] =
    Math.max(
      activities[activity] ?? 0,
      value,
    );

  await writeObject(
    `${ACTIVITIES_PREFIX}${getLocalDay()}`,
    activities,
  );

  return activities;
}

export async function getActivity(
  activity: string,
) {
  const activities =
    await getActivities();

  return activities[activity] ?? 0;
}

export async function getTotalTasks() {
  return readNumber(
    'seeker_total_tasks',
  );
}

export async function getCheckinState(): Promise<CheckinState> {
  return readObject<CheckinState>(
    CHECKIN_KEY,
    {
      currentStreak: 0,
      totalCheckins: 0,
      longestStreak: 0,
      lastCheckinDate: null,
      lastCheckinAt: null,
    },
  );
}

export async function canCheckIn() {
  const state =
    await getCheckinState();

  return (
    state.lastCheckinDate !==
    getLocalDay()
  );
}

export async function checkIn() {
  const today =
    getLocalDay();

  const state =
    await getCheckinState();

  if (
    state.lastCheckinDate ===
    today
  ) {
    return {
      added: false,
      alreadyCheckedIn: true,
      xp: 0,
      state,
    };
  }

  const yesterday =
    getYesterdayDay();

  const currentStreak =
    state.lastCheckinDate ===
    yesterday
      ? state.currentStreak + 1
      : 1;

  const totalCheckins =
    state.totalCheckins + 1;

  const longestStreak =
    Math.max(
      state.longestStreak,
      currentStreak,
    );

  const nextState: CheckinState = {
    currentStreak,
    totalCheckins,
    longestStreak,
    lastCheckinDate: today,
    lastCheckinAt: Date.now(),
  };

  await writeObject(
    CHECKIN_KEY,
    nextState,
  );

  const xp = Math.min(
    50 +
      (currentStreak - 1) * 5,
    100,
  );

  await addXp(xp);
  await addDailyXp(xp);

  await recordActivity(
    'daily_checkin',
  );

  await setActivityMax(
    'checkin_streak',
    currentStreak,
  );

  await unlockBadges();

  return {
    added: true,
    alreadyCheckedIn: false,
    xp,
    state: nextState,
  };
}

function defaultGameState(): GameState {
  return {
    attempts: 0,
    lastAttemptAt: null,
    bestScore: 0,
    totalScore: 0,
  };
}

export async function getGameState(
  gameId: string,
): Promise<GameState> {
  return readObject<GameState>(
    `${GAME_PREFIX}${gameId}`,
    defaultGameState(),
  );
}

export async function startGameAttempt(
  gameId: string,
) {
  const state =
    await getGameState(gameId);

  const now = Date.now();

  if (
    state.lastAttemptAt &&
    now - state.lastAttemptAt >=
      DAY_MS
  ) {
    state.attempts = 0;
  }

  if (state.attempts >= 2) {
    return {
      allowed: false,
      state,
      resetAt:
        state.lastAttemptAt
          ? state.lastAttemptAt + DAY_MS
          : Date.now() + DAY_MS,
    };
  }

  state.attempts += 1;
  state.lastAttemptAt = now;

  await writeObject(
    `${GAME_PREFIX}${gameId}`,
    state,
  );

  return {
    allowed: true,
    state,
    resetAt:
      state.lastAttemptAt + DAY_MS,
  };
}

export async function finishGameAttempt(
  gameId: string,
  score: number,
  xp: number,
) {
  const state =
    await getGameState(gameId);

  state.bestScore =
    Math.max(
      state.bestScore,
      Math.max(0, score),
    );

  state.totalScore +=
    Math.max(0, score);

  await writeObject(
    `${GAME_PREFIX}${gameId}`,
    state,
  );

  if (xp > 0) {
    await addXp(xp);
    await addDailyXp(xp);
  }

  await recordActivity(
    'game_completed',
  );

  await recordActivity(
    `game_${gameId}_completed`,
  );

  if (
    gameId === 'quiz' &&
    score >= 8
  ) {
    await recordActivity(
      'quiz_ace',
    );
  }

  await unlockBadges();

  return {
    ...state,
    xp: await getXp(),
  };
}

export async function getGameStates(
  gameIds?: string[],
) {
  const ids = gameIds ?? [
    'quiz',
    'memory',
    'reaction',
    'coin',
    'math',
    'number',
    'color',
    'sequence',
    'odd',
    'sprint',
  ];

  const result: Record<
    string,
    GameState
  > = {};

  for (const id of ids) {
    result[id] =
      await getGameState(id);
  }

  return result;
}

function defaultEventProgress(
  eventId: string,
): EventProgress {
  return {
    eventId,
    joined: false,
    eventXp: 0,
    completedTasks: [],
    rewardsClaimed: [],
    joinedAt: null,
    completedAt: null,
  };
}

export async function getEventProgress(
  eventId: string,
) {
  return readObject<EventProgress>(
    `${EVENT_PREFIX}${eventId}`,
    defaultEventProgress(eventId),
  );
}

export async function joinEvent(
  eventId: string,
) {
  const progress =
    await getEventProgress(eventId);

  if (progress.joined) {
    return progress;
  }

  progress.joined = true;
  progress.joinedAt =
    Date.now();

  await writeObject(
    `${EVENT_PREFIX}${eventId}`,
    progress,
  );

  await recordActivity(
    'event_joined',
  );

  await unlockBadges();

  return progress;
}

export async function completeEventTask(
  eventId: string,
  taskId: string,
  eventXp: number,
) {
  const progress =
    await getEventProgress(eventId);

  if (!progress.joined) {
    return {
      added: false,
      progress,
    };
  }

  if (
    progress.completedTasks.includes(
      taskId,
    )
  ) {
    return {
      added: false,
      progress,
    };
  }

  const safeXp = Math.max(
    0,
    Math.round(eventXp),
  );

  progress.completedTasks.push(
    taskId,
  );

  progress.eventXp += safeXp;

  if (
    progress.eventXp >= 1000 &&
    !progress.completedAt
  ) {
    progress.completedAt =
      Date.now();

    await recordActivity(
      'event_completed',
    );
  }

  await writeObject(
    `${EVENT_PREFIX}${eventId}`,
    progress,
  );

  await recordActivity(
    'event_task_completed',
  );

  await setActivityMax(
    'best_event_xp',
    progress.eventXp,
  );

  await unlockBadges();

  return {
    added: true,
    progress,
  };
}

export async function claimEventReward(
  eventId: string,
  rewardId: string,
) {
  const progress =
    await getEventProgress(eventId);

  if (
    !progress.rewardsClaimed.includes(
      rewardId,
    )
  ) {
    progress.rewardsClaimed.push(
      rewardId,
    );

    await writeObject(
      `${EVENT_PREFIX}${eventId}`,
      progress,
    );
  }

  return {
    claimed: true,
    progress,
  };
}

export async function getBadges() {
  return readList(
    BADGES_KEY,
  );
}

export async function unlockBadges() {
  const unlocked =
    await getBadges();

  const activities =
    await getActivities();

  const xp =
    await getXp();

  const checkin =
    await getCheckinState();

  const games =
    await getGameStates();

  const checks: Record<
    string,
    boolean
  > = {
    wallet_ready:
      (await AsyncStorage.getItem(
        WALLET_KEY,
      )) !== null,

    first_steps:
      (await getTotalTasks()) > 0,

    arcade_rookie:
      (activities.game_completed ??
        0) > 0,

    quiz_ace:
      (activities.quiz_ace ??
        0) > 0,

    memory_master:
      (games.memory?.attempts ?? 0) > 0,

    explorer:
      (activities.discover_visit ??
        0) > 0,

    combo_master:
      (activities.daily_combo ??
        0) > 0,

    level_5:
      getLevel(xp) >= 5,

    event_runner:
      (activities.event_task_completed ??
        0) > 0,

    seven_day:
      checkin.longestStreak >= 7,

    fourteen_day:
      checkin.longestStreak >= 14,

    thirty_day:
      checkin.longestStreak >= 30,
  };

  const next = [
    ...unlocked,
  ];

  for (const badge of BADGES) {
    if (
      checks[badge.id] &&
      !next.includes(badge.id)
    ) {
      next.push(badge.id);
    }
  }

  if (
    next.length !==
    unlocked.length
  ) {
    await writeList(
      BADGES_KEY,
      next,
    );
  }

  return next;
}

export function formatCooldown(
  lastAttemptAt: number | null,
) {
  if (!lastAttemptAt) {
    return 'READY';
  }

  const remaining =
    Math.max(
      0,
      DAY_MS -
        (Date.now() -
          lastAttemptAt),
    );

  if (remaining <= 0) {
    return 'READY';
  }

  const hours = Math.floor(
    remaining /
      (60 * 60 * 1000),
  );

  const minutes = Math.floor(
    (remaining %
      (60 * 60 * 1000)) /
      (60 * 1000),
  );

  return `${hours}h ${minutes}m`;
}

export async function syncProfileProgress() {
  try {
    const wallet = await AsyncStorage.getItem(WALLET_KEY);

    if (!wallet) {
      return false;
    }

    const xp = await getXp();
    const checkin = await getCheckinState();
    const questsCompleted = await getTotalTasks();
    const level = getLevel(xp);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        wallet_address: wallet,
        xp,
        level,
        streak: checkin.currentStreak,
        longest_streak: checkin.longestStreak,
        quests_completed: questsCompleted,
      })
      .eq('id', user.id);

    if (error) {
      console.log('Profile progress sync error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.log('Profile progress sync failed:', error);
    return false;
  }
}
