import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>SEEKER QUEST</Text>

        <Text style={styles.title}>
          Your daily reason to explore Solana.
        </Text>

        <Text style={styles.subtitle}>
          Complete quests, discover apps, earn XP and climb the leaderboard.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.buttonText}>START QUESTING</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#FFFFFF',
    marginBottom: 35,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAB7C8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 330,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  buttonText: {
    color: '#07111F',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
});