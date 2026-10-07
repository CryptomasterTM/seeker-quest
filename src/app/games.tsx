import { router } from 'expo-router';
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMobileWallet } from '@wallet-ui/react-native-web3js';

import {
  finishGameAttempt,
  formatCooldown,
  getGameStates,
  getGameState,
  startGameAttempt,
  recordActivity,
} from '../lib/seekerProgress';

type GameId =
  | 'quiz'
  | 'memory'
  | 'reaction'
  | 'coin'
  | 'math'
  | 'number'
  | 'color'
  | 'sequence'
  | 'odd'
  | 'sprint';

type GameInfo = {
  id: GameId;
  title: string;
  icon: string;
  subtitle: string;
  maxXp: number;
};

const GAMES: GameInfo[] = [
  {
    id: 'quiz',
    title: 'Seeker Quiz',
    icon: '?',
    subtitle: '8 fresh questions every run',
    maxXp: 200,
  },
  {
    id: 'memory',
    title: 'Memory Match',
    icon: '◆',
    subtitle: 'Match 4 pairs before your moves run out',
    maxXp: 180,
  },
  {
    id: 'reaction',
    title: 'Reaction Rush',
    icon: '⚡',
    subtitle: 'React fast across 8 rounds',
    maxXp: 150,
  },
  {
    id: 'coin',
    title: 'Coin Rush',
    icon: '◉',
    subtitle: 'Catch the moving coin',
    maxXp: 150,
  },
  {
    id: 'math',
    title: 'Math Blitz',
    icon: '＋',
    subtitle: 'Solve rapid-fire calculations',
    maxXp: 180,
  },
  {
    id: 'number',
    title: 'Number Hunt',
    icon: '#',
    subtitle: 'Find the target before it moves',
    maxXp: 160,
  },
  {
    id: 'color',
    title: 'Color Pulse',
    icon: '●',
    subtitle: 'Match the target color',
    maxXp: 160,
  },
  {
    id: 'sequence',
    title: 'Sequence Recall',
    icon: '↗',
    subtitle: 'Remember the pattern',
    maxXp: 180,
  },
  {
    id: 'odd',
    title: 'Odd One Out',
    icon: '◇',
    subtitle: 'Spot the different tile',
    maxXp: 170,
  },
  {
    id: 'sprint',
    title: 'Solana Sprint',
    icon: 'S',
    subtitle: 'Fast true or false challenge',
    maxXp: 200,
  },
];

const QUIZ_BANK = [
  [
    'What does SKR represent in the Seeker ecosystem?',
    ['A Solana token', 'A password', 'A browser', 'A game score'],
    0,
  ],
  [
    'What is a public key used for?',
    ['To identify an account', 'To hide a password', 'To generate internet', 'To reset a wallet'],
    0,
  ],
  [
    'Which network is The Seeker designed around?',
    ['Solana', 'Bitcoin', 'Ethereum', 'Polygon'],
    0,
  ],
  [
    'What should unlock participation in The Seeker?',
    ['A compatible wallet', 'A screenshot', 'A username only', 'Nothing'],
    0,
  ],
  [
    'What happens to daily tasks?',
    ['They refresh every day', 'They never change', 'They refresh yearly', 'They disappear forever'],
    0,
  ],
  [
    'What is Phantom?',
    ['A crypto wallet', 'A game engine', 'A web browser', 'An exchange'],
    0,
  ],
  [
    'What is a blockchain?',
    ['A shared ledger', 'A private email', 'A phone setting', 'A gaming console'],
    0,
  ],
  [
    'What does a wallet private key control?',
    ['Access to signing authority', 'Your screen brightness', 'Your Wi-Fi', 'Your username'],
    0,
  ],
  [
    'What is XP used for in The Seeker?',
    ['Progression and levels', 'Buying internet data', 'Changing your phone', 'Unlocking email'],
    0,
  ],
  [
    'What is the Seeker Arcade?',
    ['A collection of mini games', 'An exchange', 'A wallet backup', 'A browser extension'],
    0,
  ],
  [
    'What happens when a game reaches its daily limit?',
    ['It locks until the cooldown ends', 'Your wallet disconnects', 'XP is deleted', 'The app closes'],
    0,
  ],
  [
    'Why are event tasks separate from daily tasks?',
    ['They track event-specific progress', 'They have no rewards', 'They are the same task list', 'They are only for admins'],
    0,
  ],
  [
    'What does a leaderboard show?',
    ['Player rankings', 'Private keys', 'Recovery phrases', 'Phone settings'],
    0,
  ],
  [
    'What does a badge represent?',
    ['An achievement', 'A transaction fee', 'A password', 'A wallet address'],
    0,
  ],
  [
    'What should you never share?',
    ['Your private key or recovery phrase', 'Your public address', 'Your game score', 'Your level'],
    0,
  ],
  [
    'What is a transaction?',
    ['An on-chain action', 'A game badge', 'A profile picture', 'A phone notification'],
    0,
  ],
  [
    'What is a smart contract?',
    ['Program logic on a blockchain', 'A phone charger', 'A browser tab', 'A login password'],
    0,
  ],
  [
    'What does decentralization mean in simple terms?',
    ['Control is distributed', 'One person controls everything', 'A phone is offline', 'A game has no timer'],
    0,
  ],
  [
    'What is a blockchain address?',
    ['A public destination for blockchain activity', 'A secret phrase', 'A phone number', 'A username'],
    0,
  ],
  [
    'What does a wallet signature prove?',
    ['The wallet approved a message or transaction', 'Your phone is charged', 'You won a game', 'Your profile is public'],
    0,
  ],
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [
      copy[j],
      copy[i],
    ];
  }

  return copy;
}

function randomInt(min: number, max: number) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function xpFor(
  id: GameId,
  score: number
): number {
  switch (id) {
    case 'quiz':
      return Math.min(200, Math.round(score * 25));

    case 'memory':
      return Math.min(
        180,
        Math.max(35, score * 2)
      );

    case 'reaction':
      return Math.min(150, score * 18);

    case 'coin':
      return Math.min(150, score * 6);

    case 'math':
      return Math.min(180, score * 22.5);

    case 'number':
      return Math.min(160, score * 20);

    case 'color':
      return Math.min(160, score * 20);

    case 'sequence':
      return Math.min(180, score * 36);

    case 'odd':
      return Math.min(170, score * 21.25);

    case 'sprint':
      return Math.min(200, score * 20);

    default:
      return 0;
  }
}

function getGameInfo(
  id: GameId
) {
  return GAMES.find(
    (game) => game.id === id
  )!;
}

export default function GamesScreen() {
  const {
    connect,
    account,
  } = useMobileWallet();

  const [
    wallet,
    setWallet,
  ] = useState<string | null>(null);

  const [
    activeGame,
    setActiveGame,
  ] = useState<GameId | null>(null);

  const [
    gameStates,
    setGameStates,
  ] = useState<
    Record<string, any>
  >({});

  const [starting, setStarting] =
    useState(false);

  useEffect(() => {
    loadWallet();
    loadGames();
  }, []);

  async function loadWallet() {
    const saved =
      await AsyncStorage.getItem(
        'seeker_wallet'
      );

    const live =
      account?.address?.toString() ??
      null;

    setWallet(live || saved);
  }

  async function loadGames() {
    const states =
      await getGameStates(
        GAMES.map((game) => game.id)
      );

    setGameStates(states);
  }

  async function gateWallet() {
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
          'Connect your compatible Solana wallet before playing.'
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

      return true;
    } catch (error) {
      console.log(
        'GAME WALLET ERROR:',
        error
      );

      Alert.alert(
        'Wallet connection failed',
        'We could not connect your wallet.'
      );

      return false;
    }
  }

  async function startGame(
    gameId: GameId
  ) {
    if (!(await gateWallet())) {
      return;
    }

    setStarting(true);

    try {
      const result =
        await startGameAttempt(
          gameId
        );

      if (!result.allowed) {
        Alert.alert(
          'GAME LOCKED',
          `Both attempts are used.\n\nCome back in ${formatCooldown(
            result.resetAt
          )}.`
        );

        await loadGames();
        return;
      }

      setGameStates(
        (current) => ({
          ...current,
          [gameId]: result.state,
        })
      );

      setActiveGame(gameId);
    } finally {
      setStarting(false);
    }
  }

  async function finishGame(
    score: number
  ) {
    if (!activeGame) {
      return;
    }

    const info =
      getGameInfo(activeGame);

    const awarded = Math.min(
      info.maxXp,
      Math.max(
        0,
        Math.round(
          xpFor(
            activeGame,
            score
          )
        )
      )
    );

    const result =
      await finishGameAttempt(
        activeGame,
        score,
        awarded
      );

    const title =
      info.title;

    setActiveGame(null);

    await loadGames();

    Alert.alert(
      `${title} COMPLETE`,
      `Score: ${score}\nXP earned: +${awarded}\n\nTotal XP: ${result.xp}`,
    );
  }

  if (!wallet) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.lockLogo}>
          SKR
        </Text>

        <Text style={styles.lockTitle}>
          SEEKER ARCADE
        </Text>

        <Text style={styles.lockText}>
          Ten games. Two tries each. Fresh
          challenges every day.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={gateWallet}
        >
          <Text
            style={styles.primaryButtonText}
          >
            CONNECT WALLET
          </Text>
        </Pressable>
      </View>
    );
  }

  if (activeGame === 'quiz') {
    return (
      <QuizGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'memory') {
    return (
      <MemoryGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'reaction') {
    return (
      <ReactionGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'coin') {
    return (
      <CoinGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'math') {
    return (
      <MathGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'number') {
    return (
      <NumberGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'color') {
    return (
      <ColorGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'sequence') {
    return (
      <SequenceGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'odd') {
    return (
      <OddGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  if (activeGame === 'sprint') {
    return (
      <SprintGame
        onFinish={finishGame}
        onExit={() =>
          setActiveGame(null)
        }
      />
    );
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={
        styles.content
      }
    ><View nativeID="SEEKER_BACK_HOME_GAMES" style={{ marginBottom: 4 }}>
  <Pressable
    onPress={() => router.replace('/home')}
    style={{
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 2,
      marginBottom: 8,
    }}
  >
    <Text style={{ color: '#6B9DDB', fontSize: 13, fontWeight: '800' }}>
      ← Back Home
    </Text>
  </Pressable>
</View>

      <Text style={styles.eyebrow}>
        THE SEEKER
      </Text>

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Arcade
          </Text>
          <Text style={styles.subtitle}>
            Play. Score. Level up.
          </Text>
        </View>

        <View style={styles.walletPill}>
          <View style={styles.liveDot} />
          <Text style={styles.walletPillText}>
            WALLET
          </Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>
          DAILY ARCADE
        </Text>

        <Text style={styles.heroTitle}>
          20 total tries
        </Text>

        <Text style={styles.heroText}>
          Every game gives you 2 attempts.
          Hit the XP cap, chase your high
          score, then come back after the
          24-hour reset.
        </Text>
      </View>

      {GAMES.map((game, index) => {
        const state =
          gameStates[game.id];

        const attempts =
          state?.attempts ?? 0;

        const locked =
          attempts >= 2;

        const resetAt =
          state?.windowStart
            ? state.windowStart +
              24 * 60 * 60 * 1000
            : null;

        return (
          <Pressable
            key={game.id}
            style={[
              styles.gameCard,
              locked &&
                styles.gameCardLocked,
            ]}
            disabled={
              starting || locked
            }
            onPress={() =>
              startGame(game.id)
            }
          >
            <View style={styles.gameIcon}>
              <Text style={styles.gameIconText}>
                {game.icon}
              </Text>
            </View>

            <View style={styles.gameInfo}>
              <View
                style={
                  styles.gameTitleRow
                }
              >
                <Text
                  style={styles.gameTitle}
                >
                  {index + 1}.{' '}
                  {game.title}
                </Text>

                <Text
                  style={
                    styles.maxXp
                  }
                >
                  MAX {game.maxXp} XP
                </Text>
              </View>

              <Text
                style={styles.gameSubtitle}
              >
                {game.subtitle}
              </Text>

              <View
                style={styles.metaRow}
              >
                <Text
                  style={styles.attemptText}
                >
                  {locked
                    ? `LOCKED • ${formatCooldown(
                        resetAt
                      )}`
                    : `${2 - attempts}/2 TRIES LEFT`}
                </Text>

                <Text
                  style={styles.bestText}
                >
                  BEST {state?.bestScore ?? 0}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}

      <Text style={styles.footer}>
        THE SEEKER • PLAY DAILY • BUILD YOUR
        SCORE
      </Text>
    </ScrollView>
  );
}

function GameShell({
  eyebrow,
  title,
  children,
  onExit,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  onExit: () => void;
}) {
  return (
    <View style={styles.gameScreen}>
      <Text style={styles.eyebrow}>
        {eyebrow}
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>

      {children}

      <Pressable
        onPress={onExit}
        style={styles.backButton}
      >
        <Text
          style={styles.backButtonText}
        >
          ← EXIT GAME
        </Text>
      </Pressable>
    </View>
  );
}

function QuizGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const questions =
    useMemo(
      () =>
        shuffle(QUIZ_BANK)
          .slice(0, 8),
      []
    );

  const [index, setIndex] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [locked, setLocked] =
    useState(false);

  const item =
    questions[index];

  function answer(choice: number) {
    if (locked) return;

    setLocked(true);

    const correct =
      choice === item[2];

    const nextScore =
      score + (correct ? 1 : 0);

    setScore(nextScore);

    setTimeout(() => {
      if (index === questions.length - 1) {
        onFinish(nextScore);
        return;
      }

      setIndex(
        (value) => value + 1
      );

      setLocked(false);
    }, 250);
  }

  return (
    <GameShell
      eyebrow="SEEKER QUIZ"
      title={`Question ${
        index + 1
      }/8`}
      onExit={onExit}
    >
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${
                ((index + 1) /
                  questions.length) *
                100
              }%`,
            },
          ]}
        />
      </View>

      <Text style={styles.question}>
        {item[0] as string}
      </Text>

      {(item[1] as string[]).map(
        (answerText, choice) => (
          <Pressable
            key={answerText}
            style={styles.answer}
            onPress={() =>
              answer(choice)
            }
          >
            <Text
              style={
                styles.answerText
              }
            >
              {answerText}
            </Text>
          </Pressable>
        )
      )}

      <Text style={styles.scoreSmall}>
        SCORE {score}
      </Text>
    </GameShell>
  );
}

function MemoryGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const values = [
    'S',
    'K',
    'R',
    '◎',
  ];

  const [
    cards,
    setCards,
  ] = useState(() =>
    shuffle([
      ...values,
      ...values,
    ]).map(
      (value, index) => ({
        id: `${value}-${index}`,
        value,
        open: false,
        matched: false,
      })
    )
  );

  const [
    selected,
    setSelected,
  ] = useState<number[]>([]);

  const [
    moves,
    setMoves,
  ] = useState(0);

  const [
    waiting,
    setWaiting,
  ] = useState(false);

  const matchedCount =
    cards.filter(
      (card) => card.matched
    ).length;

  useEffect(() => {
    if (matchedCount === cards.length) {
      const score = Math.max(
        40,
        100 - (moves - 4) * 5
      );

      onFinish(score);
    }
  }, [
    matchedCount,
    cards.length,
    moves,
    onFinish,
  ]);

  function tapCard(index: number) {
    if (waiting) return;
    if (selected.length === 2) return;

    const card =
      cards[index];

    if (
      card.open ||
      card.matched
    ) {
      return;
    }

    const nextCards =
      [...cards];

    nextCards[index] = {
      ...card,
      open: true,
    };

    const nextSelected =
      [...selected, index];

    setCards(nextCards);
    setSelected(
      nextSelected
    );

    if (nextSelected.length === 2) {
      setMoves(
        (value) => value + 1
      );
      setWaiting(true);

      const [
        first,
        second,
      ] = nextSelected;

      if (
        nextCards[first].value ===
        nextCards[second].value
      ) {
        setTimeout(() => {
          setCards(
            (current) =>
              current.map(
                (entry, cardIndex) =>
                  cardIndex === first ||
                  cardIndex === second
                    ? {
                        ...entry,
                        matched: true,
                      }
                    : entry
              )
          );

          setSelected([]);
          setWaiting(false);
        }, 350);
      } else {
        setTimeout(() => {
          setCards(
            (current) =>
              current.map(
                (entry, cardIndex) =>
                  cardIndex === first ||
                  cardIndex === second
                    ? {
                        ...entry,
                        open: false,
                      }
                    : entry
              )
          );

          setSelected([]);
          setWaiting(false);
        }, 650);
      }
    }
  }

  return (
    <GameShell
      eyebrow="MEMORY MATCH"
      title="Find all 4 pairs"
      onExit={onExit}
    >
      <View
        style={styles.memoryHeader}
      >
        <Text style={styles.scoreSmall}>
          MOVES {moves}
        </Text>

        <Text style={styles.scoreSmall}>
          MATCHED {matchedCount / 2}/4
        </Text>
      </View>

      <View style={styles.memoryGrid}>
        {cards.map(
          (card, index) => (
            <Pressable
              key={card.id}
              style={[
                styles.memoryCard,
                (card.open ||
                  card.matched) &&
                  styles.memoryCardOpen,
              ]}
              onPress={() =>
                tapCard(index)
              }
            >
              <Text
                style={
                  styles.memorySymbol
                }
              >
                {card.open ||
                card.matched
                  ? card.value
                  : '?'}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <Text style={styles.helpText}>
        Every new attempt reshuffles all
        4 pairs.
      </Text>
    </GameShell>
  );
}

function ReactionGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const [
    round,
    setRound,
  ] = useState(1);

  const [
    hits,
    setHits,
  ] = useState(0);

  const [
    live,
    setLive,
  ] = useState(false);

  useEffect(() => {
    const delay =
      randomInt(700, 1600);

    const timer =
      setTimeout(() => {
        setLive(true);
      }, delay);

    return () =>
      clearTimeout(timer);
  }, [round]);

  function hit() {
    if (!live) return;

    const nextHits =
      hits + 1;

    setHits(nextHits);
    setLive(false);

    if (round >= 8) {
      onFinish(nextHits);
      return;
    }

    setRound(
      (value) => value + 1
    );
  }

  return (
    <GameShell
      eyebrow="REACTION RUSH"
      title={`Round ${round}/8`}
      onExit={onExit}
    >
      <Text style={styles.centerText}>
        Tap the circle when it lights up.
      </Text>

      <Pressable
        style={[
          styles.bigPlay,
          live &&
            styles.bigPlayLive,
        ]}
        onPress={hit}
      >
        <Text
          style={styles.bigPlayText}
        >
          {live ? 'TAP' : 'WAIT'}
        </Text>
      </Pressable>

      <Text style={styles.bigScore}>
        {hits}
      </Text>

      <Text
        style={styles.scoreSmall}
      >
        FAST HITS
      </Text>
    </GameShell>
  );
}

function CoinGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const [
    seconds,
    setSeconds,
  ] = useState(12);

  const [
    coin,
    setCoin,
  ] = useState(
    randomInt(0, 15)
  );

  const [
    score,
    setScore,
  ] = useState(0);

  useEffect(() => {
    const timer =
      setInterval(() => {
        setSeconds(
          (value) => {
            if (value <= 1) {
              clearInterval(timer);
              return 0;
            }

            return value - 1;
          }
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      onFinish(score);
    }
  }, [seconds, onFinish, score]);

  function tapTile(index: number) {
    if (seconds === 0) return;

    if (index === coin) {
      setScore(
        (value) => value + 1
      );

      setCoin(
        randomInt(0, 15)
      );
    }
  }

  return (
    <GameShell
      eyebrow="COIN RUSH"
      title={`${seconds}s left`}
      onExit={onExit}
    >
      <Text style={styles.centerText}>
        Catch the coin before it moves.
      </Text>

      <View style={styles.coinGrid}>
        {Array.from(
          { length: 16 },
          (_, index) => (
            <Pressable
              key={index}
              style={[
                styles.coinTile,
                index === coin &&
                  styles.coinTileActive,
              ]}
              onPress={() =>
                tapTile(index)
              }
            >
              <Text
                style={
                  styles.coinText
                }
              >
                {index === coin
                  ? '◎'
                  : ''}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <Text style={styles.bigScore}>
        {score}
      </Text>
    </GameShell>
  );
}

function MathGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const [
    round,
    setRound,
  ] = useState(1);

  const [
    correct,
    setCorrect,
  ] = useState(0);

  const question =
    useMemo(() => {
      const a =
        randomInt(2, 12);

      const b =
        randomInt(2, 12);

      const op =
        Math.random() > 0.5
          ? '+'
          : '×';

      const answer =
        op === '+'
          ? a + b
          : a * b;

      const choices =
        shuffle([
          answer,
          answer + randomInt(1, 5),
          Math.max(
            0,
            answer - randomInt(1, 5)
          ),
          answer +
            randomInt(6, 12),
        ]);

      return {
        text: `${a} ${op} ${b} = ?`,
        answer,
        choices,
      };
    }, [round]);

  function answer(choice: number) {
    const isCorrect =
      choice === question.answer;

    const nextCorrect =
      correct +
      (isCorrect ? 1 : 0);

    setCorrect(
      nextCorrect
    );

    if (round >= 8) {
      onFinish(nextCorrect);
      return;
    }

    setRound(
      (value) => value + 1
    );
  }

  return (
    <GameShell
      eyebrow="MATH BLITZ"
      title={`Problem ${round}/8`}
      onExit={onExit}
    >
      <Text style={styles.question}>
        {question.text}
      </Text>

      {question.choices.map(
        (choice) => (
          <Pressable
            key={choice}
            style={styles.answer}
            onPress={() =>
              answer(choice)
            }
          >
            <Text
              style={
                styles.answerText
              }
            >
              {choice}
            </Text>
          </Pressable>
        )
      )}

      <Text style={styles.scoreSmall}>
        CORRECT {correct}
      </Text>
    </GameShell>
  );
}

function NumberGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const [
    round,
    setRound,
  ] = useState(1);

  const [
    hits,
    setHits,
  ] = useState(0);

  const [
    target,
    setTarget,
  ] = useState(
    randomInt(0, 9)
  );

  const [
    board,
    setBoard,
  ] = useState(() =>
    Array.from(
      { length: 12 },
      () => randomInt(0, 9)
    )
  );

  function nextBoard() {
    setTarget(
      randomInt(0, 9)
    );

    setBoard(() =>
      Array.from(
        { length: 12 },
        () => randomInt(0, 9)
      )
    );
  }

  function tap(value: number) {
    const nextHits =
      hits +
      (value === target ? 1 : 0);

    setHits(nextHits);

    if (round >= 8) {
      onFinish(nextHits);
      return;
    }

    setRound(
      (value) => value + 1
    );

    nextBoard();
  }

  return (
    <GameShell
      eyebrow="NUMBER HUNT"
      title={`Round ${round}/8`}
      onExit={onExit}
    >
      <Text style={styles.centerText}>
        Find:
      </Text>

      <Text style={styles.targetNumber}>
        {target}
      </Text>

      <View style={styles.numberGrid}>
        {board.map(
          (value, index) => (
            <Pressable
              key={`${index}-${value}`}
              style={styles.numberTile}
              onPress={() =>
                tap(value)
              }
            >
              <Text
                style={
                  styles.numberTileText
                }
              >
                {value}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <Text style={styles.scoreSmall}>
        HITS {hits}
      </Text>
    </GameShell>
  );
}

function ColorGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const colors = [
    'BLUE',
    'PURPLE',
    'CYAN',
    'WHITE',
  ];

  const [
    round,
    setRound,
  ] = useState(1);

  const [
    correct,
    setCorrect,
  ] = useState(0);

  const [
    target,
    setTarget,
  ] = useState(
    colors[
      randomInt(
        0,
        colors.length - 1
      )
    ]
  );

  function answer(value: string) {
    const next =
      correct +
      (value === target ? 1 : 0);

    setCorrect(next);

    if (round >= 8) {
      onFinish(next);
      return;
    }

    setRound(
      (value) => value + 1
    );

    setTarget(
      colors[
        randomInt(
          0,
          colors.length - 1
        )
      ]
    );
  }

  return (
    <GameShell
      eyebrow="COLOR PULSE"
      title={`Round ${round}/8`}
      onExit={onExit}
    >
      <Text style={styles.centerText}>
        MATCH THE COLOR
      </Text>

      <View style={styles.colorTarget}>
        <Text
          style={styles.colorTargetText}
        >
          {target}
        </Text>
      </View>

      {colors.map(
        (color) => (
          <Pressable
            key={color}
            style={styles.answer}
            onPress={() =>
              answer(color)
            }
          >
            <Text
              style={
                styles.answerText
              }
            >
              {color}
            </Text>
          </Pressable>
        )
      )}

      <Text style={styles.scoreSmall}>
        CORRECT {correct}
      </Text>
    </GameShell>
  );
}

function SequenceGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const symbols = [
    '▲',
    '◆',
    '●',
    '★',
  ];

  const [
    round,
    setRound,
  ] = useState(1);

  const [
    sequence,
    setSequence,
  ] = useState<string[]>([]);

  const [
    shown,
    setShown,
  ] = useState(true);

  const [
    input,
    setInput,
  ] = useState(0);

  const [
    score,
    setScore,
  ] = useState(0);

  useEffect(() => {
    const nextSequence =
      Array.from(
        {
          length:
            round + 2,
        },
        () =>
          symbols[
            randomInt(
              0,
              symbols.length - 1
            )
          ]
      );

    setSequence(
      nextSequence
    );

    setShown(true);
    setInput(0);

    const timer =
      setTimeout(() => {
        setShown(false);
      }, 1200 + round * 100);

    return () =>
      clearTimeout(timer);
  }, [round]);

  function choose(value: string) {
    if (shown) return;

    const expected =
      sequence[input];

    if (value !== expected) {
      if (round >= 5) {
        onFinish(score);
        return;
      }

      setRound(
        (value) => value + 1
      );

      return;
    }

    const nextInput =
      input + 1;

    if (
      nextInput >=
      sequence.length
    ) {
      const nextScore =
        score + 1;

      setScore(
        nextScore
      );

      if (round >= 5) {
        onFinish(nextScore);
        return;
      }

      setRound(
        (value) => value + 1
      );

      return;
    }

    setInput(
      nextInput
    );
  }

  return (
    <GameShell
      eyebrow="SEQUENCE RECALL"
      title={`Round ${round}/5`}
      onExit={onExit}
    >
      <Text style={styles.centerText}>
        {shown
          ? 'MEMORIZE THIS'
          : 'REPEAT IT'}
      </Text>

      <Text style={styles.sequence}>
        {shown
          ? sequence.join(' ')
          : '???'}
      </Text>

      {!shown && (
        <View
          style={styles.sequenceButtons}
        >
          {symbols.map(
            (symbol) => (
              <Pressable
                key={symbol}
                style={styles.sequenceButton}
                onPress={() =>
                  choose(symbol)
                }
              >
                <Text
                  style={
                    styles.sequenceText
                  }
                >
                  {symbol}
                </Text>
              </Pressable>
            )
          )}
        </View>
      )}

      <Text style={styles.scoreSmall}>
        ROUNDS {score}
      </Text>
    </GameShell>
  );
}

function OddGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const [
    round,
    setRound,
  ] = useState(1);

  const [
    score,
    setScore,
  ] = useState(0);

  const [
    oddIndex,
    setOddIndex,
  ] = useState(
    randomInt(0, 8)
  );

  function choose(index: number) {
    const next =
      score +
      (index === oddIndex ? 1 : 0);

    setScore(next);

    if (round >= 8) {
      onFinish(next);
      return;
    }

    setRound(
      (value) => value + 1
    );

    setOddIndex(
      randomInt(0, 8)
    );
  }

  return (
    <GameShell
      eyebrow="ODD ONE OUT"
      title={`Round ${round}/8`}
      onExit={onExit}
    >
      <Text style={styles.centerText}>
        Find the different tile
      </Text>

      <View style={styles.oddGrid}>
        {Array.from(
          { length: 9 },
          (_, index) => (
            <Pressable
              key={index}
              style={styles.oddTile}
              onPress={() =>
                choose(index)
              }
            >
              <Text
                style={
                  styles.oddText
                }
              >
                {index === oddIndex
                  ? '○'
                  : '●'}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <Text style={styles.scoreSmall}>
        FOUND {score}
      </Text>
    </GameShell>
  );
}

const SPRINT_BANK = [
  [
    'Solana is a blockchain network.',
    true,
  ],
  [
    'A private key should be shared publicly.',
    false,
  ],
  [
    'A wallet can sign messages and transactions.',
    true,
  ],
  [
    'A public address is the same thing as a private key.',
    false,
  ],
  [
    'XP and blockchain tokens are automatically the same thing.',
    false,
  ],
  [
    'A leaderboard can rank players by score.',
    true,
  ],
  [
    'Daily tasks can refresh on a schedule.',
    true,
  ],
  [
    'A recovery phrase should be posted on social media.',
    false,
  ],
  [
    'A game can record a high score.',
    true,
  ],
  [
    'An event leaderboard and global leaderboard must always contain the same rankings.',
    false,
  ],
  [
    'A wallet connection can be used as a gate for app participation.',
    true,
  ],
  [
    'The Seeker Arcade has only one game.',
    false,
  ],
  [
    'Memory Match is a game based on finding matching pairs.',
    true,
  ],
  [
    'The correct response to a fake wallet support message is to share your seed phrase.',
    false,
  ],
  [
    'The Seeker can combine games, tasks, discovery and events.',
    true,
  ],
];

function SprintGame({
  onFinish,
  onExit,
}: {
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const statements =
    useMemo(
      () =>
        shuffle(
          SPRINT_BANK
        ).slice(0, 10),
      []
    );

  const [
    index,
    setIndex,
  ] = useState(0);

  const [
    score,
    setScore,
  ] = useState(0);

  const current =
    statements[index];

  function answer(value: boolean) {
    const next =
      score +
      (value === current[1]
        ? 1
        : 0);

    setScore(next);

    if (index >= 9) {
      onFinish(next);
      return;
    }

    setIndex(
      (valueIndex) =>
        valueIndex + 1
    );
  }

  return (
    <GameShell
      eyebrow="SOLANA SPRINT"
      title={`Round ${index + 1}/10`}
      onExit={onExit}
    >
      <Text style={styles.question}>
        {current[0] as string}
      </Text>

      <Pressable
        style={styles.trueButton}
        onPress={() =>
          answer(true)
        }
      >
        <Text
          style={styles.trueButtonText}
        >
          TRUE
        </Text>
      </Pressable>

      <Pressable
        style={styles.answer}
        onPress={() =>
          answer(false)
        }
      >
        <Text
          style={styles.answerText}
        >
          FALSE
        </Text>
      </Pressable>

      <Text style={styles.scoreSmall}>
        SCORE {score}
      </Text>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#050814',
  },

  content: {
    padding: 18,
    paddingBottom: 50,
  },

  eyebrow: {
    color: '#4DB8FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },

  subtitle: {
    color: '#7E8AA2',
    fontSize: 14,
    marginTop: 5,
  },

  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#101A30',
    borderWidth: 1,
    borderColor: '#244064',
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#55E7B3',
    marginRight: 6,
  },

  walletPillText: {
    color: '#A7B4CE',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  heroCard: {
    backgroundColor: '#0C1630',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#244777',
    padding: 20,
    marginTop: 18,
    marginBottom: 6,
  },

  heroEyebrow: {
    color: '#5B8CFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 6,
  },

  heroText: {
    color: '#8492AD',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1224',
    borderWidth: 1,
    borderColor: '#1A3157',
    borderRadius: 21,
    padding: 14,
    marginTop: 13,
  },

  gameCardLocked: {
    opacity: 0.62,
  },

  gameIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#142A50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  gameIconText: {
    color: '#5CC1FF',
    fontSize: 25,
    fontWeight: '900',
  },

  gameInfo: {
    flex: 1,
  },

  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  gameTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  maxXp: {
    color: '#8EA5FF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  gameSubtitle: {
    color: '#72809B',
    fontSize: 11,
    marginTop: 5,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  attemptText: {
    color: '#4EBFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  bestText: {
    color: '#626F88',
    fontSize: 9,
    fontWeight: '900',
  },

  footer: {
    color: '#39475F',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginTop: 32,
  },

  lockScreen: {
    flex: 1,
    backgroundColor: '#050814',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  lockLogo: {
    color: '#48B7FF',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 5,
  },

  lockTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    marginTop: 4,
  },

  lockText: {
    color: '#7C89A2',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },

  primaryButton: {
    backgroundColor: '#176CFF',
    borderRadius: 17,
    paddingHorizontal: 28,
    paddingVertical: 16,
    marginTop: 24,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },

  gameScreen: {
    flex: 1,
    backgroundColor: '#050814',
    padding: 20,
  },

  progressBar: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#111B2F',
    overflow: 'hidden',
    marginTop: 16,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4DB8FF',
  },

  question: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 31,
    fontWeight: '800',
    marginTop: 26,
    marginBottom: 18,
  },

  answer: {
    backgroundColor: '#0D162A',
    borderWidth: 1,
    borderColor: '#20375E',
    borderRadius: 16,
    padding: 17,
    marginBottom: 11,
  },

  answerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  scoreSmall: {
    color: '#5ABEFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 18,
  },

  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 'auto',
  },

  backButtonText: {
    color: '#6B9DDB',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
  },

  memoryCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#0C1428',
    borderWidth: 1,
    borderColor: '#24416B',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  memoryCardOpen: {
    backgroundColor: '#18345B',
    borderColor: '#54BEFF',
  },

  memorySymbol: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
  },

  helpText: {
    color: '#6D7C96',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },

  centerText: {
    color: '#8D9AB3',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },

  bigPlay: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#10182B',
    borderWidth: 2,
    borderColor: '#23405E',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },

  bigPlayLive: {
    backgroundColor: '#176CFF',
    borderColor: '#62CAFF',
  },

  bigPlayText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
  },

  bigScore: {
    color: '#FFFFFF',
    fontSize: 62,
    textAlign: 'center',
    fontWeight: '900',
    marginTop: 20,
  },

  coinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  coinTile: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#0B1528',
    borderWidth: 1,
    borderColor: '#20385E',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  coinTileActive: {
    backgroundColor: '#193B68',
    borderColor: '#55C4FF',
  },

  coinText: {
    color: '#FFD766',
    fontSize: 29,
    fontWeight: '900',
  },

  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  numberTile: {
    width: '30%',
    aspectRatio: 1.15,
    backgroundColor: '#0D162A',
    borderWidth: 1,
    borderColor: '#234064',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  numberTileText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
  },

  targetNumber: {
    color: '#5CC4FF',
    fontSize: 64,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },

  colorTarget: {
    width: 180,
    height: 90,
    borderRadius: 22,
    backgroundColor: '#172A4B',
    borderWidth: 1,
    borderColor: '#385F8D',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },

  colorTargetText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },

  sequence: {
    color: '#FFFFFF',
    fontSize: 35,
    letterSpacing: 10,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 25,
  },

  sequenceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },

  sequenceButton: {
    width: 78,
    height: 78,
    borderRadius: 18,
    backgroundColor: '#12213C',
    borderWidth: 1,
    borderColor: '#2B4F7E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sequenceText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },

  oddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 28,
  },

  oddTile: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#0D162A',
    borderWidth: 1,
    borderColor: '#243E65',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  oddText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },

  trueButton: {
    backgroundColor: '#176CFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 11,
  },

  trueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});



