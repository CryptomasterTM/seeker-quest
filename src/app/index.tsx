import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const glow = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.8,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.background} />

      <Animated.View
        pointerEvents="none"
        style={[styles.orb, styles.purpleOrb, { opacity: glow }]}
      />

      <Animated.View
        pointerEvents="none"
        style={[styles.orb, styles.blueOrb, { opacity: glow }]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ scale: scale }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoGlow}>
            <View style={styles.logoInner}>
              <Text style={styles.logoMark}>S</Text>
            </View>
          </View>
        </View>

        <Text style={styles.brand}>SEEKER QUEST</Text>

        <Text style={styles.mainTitle}>
          Explore the ecosystem.
        </Text>

        <Text style={styles.accentTitle}>
          Build your reputation.
        </Text>

        <Text style={styles.subtitle}>
          Learn Seeker, discover Solana apps, complete quests and turn
          exploration into progress.
        </Text>

        <Pressable
          onPress={() => router.push('/auth')}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>START EXPLORING</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>

        <Text style={styles.footer}>
          DISCOVER · LEARN · COMPLETE · PROGRESS
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03040A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },

  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#03040A',
  },

  orb: {
    position: 'absolute',
    borderRadius: 999,
  },

  purpleOrb: {
    width: 330,
    height: 330,
    backgroundColor: '#7C3AED',
    top: -120,
    right: -120,
  },

  blueOrb: {
    width: 280,
    height: 280,
    backgroundColor: '#0891B2',
    bottom: -120,
    left: -120,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  logoContainer: {
    width: 92,
    height: 92,
    borderRadius: 30,
    padding: 2,
    marginBottom: 22,
    backgroundColor: '#38BDF8',
  },

  logoGlow: {
    flex: 1,
    borderRadius: 28,
    padding: 2,
    backgroundColor: '#A855F7',
  },

  logoInner: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: '#080B16',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoMark: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    fontStyle: 'italic',
  },

  brand: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 34,
  },

  mainTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 42,
  },

  accentTitle: {
    color: '#A78BFA',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 18,
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 350,
    marginBottom: 34,
  },

  button: {
    width: '100%',
    maxWidth: 350,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500',
  },

  footer: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 24,
  },
});