import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMobileWallet } from '@wallet-ui/react-native-web3js';

const questions = [
  ['What does SKR represent in The Seeker experience?', ['A Seeker ecosystem identity', 'A game character', 'A password', 'A browser'], 0],
  ['What is the main goal of The Seeker?', ['Explore, play and progress', 'Only chat', 'Only trade', 'Only watch videos'], 0],
  ['Which network is this app designed around?', ['Solana', 'Bitcoin', 'Ethereum', 'Dogecoin'], 0],
  ['What should unlock quests and rewards?', ['A connected compatible wallet', 'A random password', 'A screenshot', 'Nothing'], 0],
  ['What happens to daily tasks?', ['They reset every 24 hours', 'They never reset', 'They reset yearly', 'They disappear permanently'], 0],
];

const memorySymbols = ['SKR', 'SOL', 'XP', '⚡', 'SKR', 'SOL', 'XP', '⚡'];

export default function GamesScreen() {
  const { connect, account } = useMobileWallet();
  const [wallet, setWallet] = useState<string | null>(null);
  const [game, setGame] = useState<'menu' | 'quiz' | 'tap' | 'memory' | 'coin'>('menu');

  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);

  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  const [cards, setCards] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const [coins, setCoins] = useState(0);
  const [coinTime, setCoinTime] = useState(15);

  useEffect(() => {
    AsyncStorage.getItem('seeker_wallet').then(setWallet);
  }, []);

  async function gate() {
    if (wallet) return true;

    const connectedAccount = await connect();
      const a = connectedAccount?.address?.toString() ?? null;

    if (!a) return false;

    await AsyncStorage.setItem('seeker_wallet', a);
    setWallet(a);
    return true;
  }

  async function startQuiz() {
    if (await gate()) {
      setGame('quiz');
      setQ(0);
      setScore(0);
    }
  }

  async function startTap() {
    if (await gate()) {
      setGame('tap');
      setTaps(0);
      setTimeLeft(10);
    }
  }

  async function startMemory() {
    if (await gate()) {
      const shuffled = [...memorySymbols].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setRevealed([]);
      setMatched([]);
      setMoves(0);
      setGame('memory');
    }
  }

  async function startCoin() {
    if (await gate()) {
      setCoins(0);
      setCoinTime(15);
      setGame('coin');
    }
  }

  useEffect(() => {
    if (game !== 'tap' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [game, timeLeft]);

  useEffect(() => {
    if (game === 'tap' && timeLeft === 0) {
      Alert.alert(
        'Reaction Rush complete!',
        `You scored ${taps} taps in 10 seconds.`
      );
      setGame('menu');
    }
  }, [game, timeLeft, taps]);

  useEffect(() => {
    if (game !== 'coin' || coinTime <= 0) return;

    const timer = setInterval(() => {
      setCoinTime((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [game, coinTime]);

  useEffect(() => {
    if (game === 'coin' && coinTime === 0) {
      Alert.alert(
        'Coin Run complete!',
        `You collected ${coins} coins.`
      );
      setGame('menu');
    }
  }, [game, coinTime, coins]);

  function flipMemory(index: number) {
    if (
      revealed.includes(index) ||
      matched.includes(index) ||
      revealed.length === 2
    ) {
      return;
    }

    const next = [...revealed, index];
    setRevealed(next);

    if (next.length === 2) {
      setMoves((value) => value + 1);

      const first = next[0];
      const second = next[1];

      if (cards[first] === cards[second]) {
        setMatched((value) => [...value, first, second]);
        setRevealed([]);

        if (matched.length + 2 === cards.length) {
          setTimeout(() => {
            Alert.alert(
              'Memory Match complete!',
              `You matched every card in ${moves + 1} moves.`
            );
            setGame('menu');
          }, 400);
        }
      } else {
        setTimeout(() => {
          setRevealed([]);
        }, 650);
      }
    }
  }

  if (!wallet) {
    return (
      <View style={s.lock}>
        <Text style={s.logo}>SKR</Text>
        <Text style={s.title}>SEEKER ARCADE</Text>
        <Text style={s.sub}>
          Connect your wallet to play mini games and build your Seeker progress.
        </Text>

        <Pressable style={s.button} onPress={gate}>
          <Text style={s.bt}>CONNECT WALLET</Text>
        </Pressable>
      </View>
    );
  }

  if (game === 'quiz') {
    const item = questions[q];

    return (
      <View style={s.page}>
        <Text style={s.eyebrow}>SEEKER QUIZ</Text>
        <Text style={s.title}>Question {q + 1}/5</Text>

        <View style={s.quizScore}>
          <Text style={s.quizScoreText}>SCORE {score}</Text>
        </View>

        <Text style={s.question}>{item[0] as string}</Text>

        {(item[1] as string[]).map((answer, i) => (
          <Pressable
            key={answer}
            style={s.answer}
            onPress={() => {
              const correct = i === item[2];
              const newScore = score + (correct ? 1 : 0);

              setScore(newScore);

              if (q === 4) {
                Alert.alert(
                  'Quiz complete',
                  `You scored ${newScore}/5.`
                );
                setGame('menu');
              } else {
                setQ(q + 1);
              }
            }}
          >
            <Text style={s.answerText}>{answer}</Text>
          </Pressable>
        ))}

        <Pressable onPress={() => setGame('menu')}>
          <Text style={s.back}>Back to Arcade</Text>
        </Pressable>
      </View>
    );
  }

  if (game === 'tap') {
    return (
      <View style={s.page}>
        <Text style={s.eyebrow}>REACTION RUSH</Text>
        <Text style={s.title}>10 Second Challenge</Text>

        <View style={s.timerBox}>
          <Text style={s.timerLabel}>TIME</Text>
          <Text style={s.timer}>{timeLeft}s</Text>
        </View>

        <Text style={s.score}>{taps}</Text>
        <Text style={s.scoreLabel}>TAPS</Text>

        <Pressable
          style={s.tap}
          onPress={() => {
            if (timeLeft > 0) {
              setTaps((value) => value + 1);
            }
          }}
        >
          <Text style={s.tapText}>TAP!</Text>
        </Pressable>

        <Pressable onPress={() => setGame('menu')}>
          <Text style={s.back}>Back to Arcade</Text>
        </Pressable>
      </View>
    );
  }

  if (game === 'memory') {
    return (
      <ScrollView
        style={s.page}
        contentContainerStyle={s.memoryContent}
      >
        <Text style={s.eyebrow}>MEMORY MATCH</Text>
        <Text style={s.title}>Match the cards</Text>

        <View style={s.memoryStats}>
          <Text style={s.memoryStat}>MOVES {moves}</Text>
          <Text style={s.memoryStat}>
            MATCHED {matched.length / 2}/4
          </Text>
        </View>

        <View style={s.grid}>
          {cards.map((symbol, index) => {
            const visible =
              revealed.includes(index) || matched.includes(index);

            return (
              <Pressable
                key={index}
                style={[
                  s.memoryCard,
                  matched.includes(index) && s.memoryMatched,
                ]}
                onPress={() => flipMemory(index)}
              >
                <Text style={visible ? s.memorySymbol : s.memoryHidden}>
                  {visible ? symbol : '?'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={() => setGame('menu')}>
          <Text style={s.back}>Back to Arcade</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (game === 'coin') {
    return (
      <View style={s.page}>
        <Text style={s.eyebrow}>COIN RUN</Text>
        <Text style={s.title}>Collect the coins</Text>

        <View style={s.timerBox}>
          <Text style={s.timerLabel}>TIME</Text>
          <Text style={s.timer}>{coinTime}s</Text>
        </View>

        <Text style={s.score}>🪙 {coins}</Text>
        <Text style={s.scoreLabel}>COINS COLLECTED</Text>

        <Pressable
          style={s.coinButton}
          onPress={() => {
            if (coinTime > 0) {
              setCoins((value) => value + 1);
            }
          }}
        >
          <Text style={s.coinText}>COLLECT</Text>
        </Pressable>

        <Pressable onPress={() => setGame('menu')}>
          <Text style={s.back}>Back to Arcade</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.eyebrow}>THE SEEKER</Text>
      <Text style={s.title}>Arcade</Text>

      <Text style={s.sub}>
        Play mini games, build your scores and collect achievements.
      </Text>

      <Pressable style={s.card} onPress={startQuiz}>
        <Text style={s.icon}>?</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle}>Seeker Quiz</Text>
          <Text style={s.cardSub}>5 questions • knowledge • XP</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </Pressable>

      <Pressable style={s.card} onPress={startTap}>
        <Text style={s.icon}>⚡</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle}>Reaction Rush</Text>
          <Text style={s.cardSub}>10 seconds • tap fast • beat your score</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </Pressable>

      <Pressable style={s.card} onPress={startMemory}>
        <Text style={s.icon}>◆</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle}>Memory Match</Text>
          <Text style={s.cardSub}>Match all 4 pairs • test your memory</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </Pressable>

      <Pressable style={s.card} onPress={startCoin}>
        <Text style={s.icon}>●</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle}>Coin Run</Text>
          <Text style={s.cardSub}>15 seconds • collect as many as possible</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </Pressable>

      <View style={s.footerCard}>
        <Text style={s.footerTitle}>MORE GAMES COMING</Text>
        <Text style={s.footerText}>
          New challenges, events and score-based achievements can be added to the arcade.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#050814',
    padding: 20,
  },
  content: {
    paddingBottom: 50,
  },
  memoryContent: {
    paddingBottom: 50,
  },
  lock: {
    flex: 1,
    backgroundColor: '#050814',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  logo: {
    color: '#40a9ff',
    fontSize: 62,
    fontWeight: '900',
    letterSpacing: 4,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 5,
  },
  sub: {
    color: '#8793ad',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  eyebrow: {
    color: '#46b1ff',
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 11,
    marginTop: 18,
  },
  button: {
    backgroundColor: '#176cff',
    padding: 17,
    paddingHorizontal: 30,
    borderRadius: 18,
    marginTop: 28,
  },
  bt: {
    color: '#fff',
    fontWeight: '900',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1224',
    borderColor: '#1b3158',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 15,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#172b52',
    color: '#4bb5ff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 17,
  },
  cardSub: {
    color: '#74829e',
    marginTop: 5,
    fontSize: 12,
  },
  arrow: {
    color: '#4cb6ff',
    fontSize: 28,
    marginLeft: 8,
  },
  question: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 31,
    marginTop: 25,
    marginBottom: 18,
  },
  answer: {
    padding: 17,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#263a61',
    backgroundColor: '#0c1224',
    marginBottom: 10,
  },
  answerText: {
    color: '#fff',
    fontSize: 15,
  },
  quizScore: {
    alignSelf: 'flex-start',
    backgroundColor: '#101f3d',
    borderWidth: 1,
    borderColor: '#284b80',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 15,
  },
  quizScoreText: {
    color: '#63bbff',
    fontSize: 10,
    fontWeight: '900',
  },
  score: {
    color: '#4eb8ff',
    fontSize: 70,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 45,
  },
  scoreLabel: {
    color: '#697791',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  timerBox: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#10182d',
    borderWidth: 1,
    borderColor: '#263e69',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 25,
  },
  timerLabel: {
    color: '#72809a',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },
  timer: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  tap: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#176cff',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  tapText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  back: {
    color: '#6fbfff',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  memoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#1d3157',
    borderRadius: 15,
    padding: 15,
    marginTop: 18,
  },
  memoryStat: {
    color: '#7ebeff',
    fontSize: 11,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  memoryCard: {
    width: '23%',
    aspectRatio: 0.82,
    backgroundColor: '#101d3b',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#28528b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  memoryMatched: {
    backgroundColor: '#123c43',
    borderColor: '#2cc9a5',
  },
  memoryHidden: {
    color: '#4daeff',
    fontSize: 25,
    fontWeight: '900',
  },
  memorySymbol: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },
  coinButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#172b52',
    borderWidth: 3,
    borderColor: '#4eb8ff',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  coinText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  footerCard: {
    backgroundColor: '#0a1020',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1b2945',
    padding: 18,
    marginTop: 20,
  },
  footerTitle: {
    color: '#5bbcff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  footerText: {
    color: '#707d97',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
});




