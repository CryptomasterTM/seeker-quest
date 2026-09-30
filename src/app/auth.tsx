import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signIn, signUp } from '../lib/auth';

export default function AuthScreen() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing information', 'Enter your email and password.');
      return;
    }

    if (isSignUp && !username.trim()) {
      Alert.alert('Missing username', 'Choose a username for your Seeker Quest profile.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short', 'Your password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = isSignUp
        ? await signUp(email.trim(), password, username.trim())
        : await signIn(email.trim(), password);

   if (result.error) {
  console.log('SUPABASE LOGIN ERROR:', result.error);
  Alert.alert(
    'Login failed',
    `${result.error.message}\n\nCode: ${result.error.code ?? 'none'}`
  );
  return;
}

      if (isSignUp && !result.data.session) {
        Alert.alert(
          'Account created',
          'Your account was created. Check your email if confirmation is required.',
        );
        return;
      } 

      router.replace('/home');
    } catch {
      Alert.alert(
        'Something went wrong',
        'We could not complete your request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.glow} />

      <View style={styles.content}>
        <Text style={styles.brand}>SEEKER QUEST</Text>

        <Text style={styles.title}>
          {isSignUp ? 'Create your Seeker identity.' : 'Welcome back.'}
        </Text>

        <Text style={styles.subtitle}>
          {isSignUp
            ? 'Explore the ecosystem, complete quests and build your reputation.'
            : 'Continue your journey across the Seeker ecosystem.'}
        </Text>

        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#64748B"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            maxLength={20}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#07111F" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.switchButton}
          onPress={() => setIsSignUp((value) => !value)}
        >
          <Text style={styles.switchText}>
            {isSignUp
              ? 'Already have an account? Sign in'
              : 'New to Seeker Quest? Create an account'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050914',
    justifyContent: 'center',
    padding: 24,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#5B21B6',
    opacity: 0.12,
    top: 80,
    right: -100,
  },
  content: {
    width: '100%',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 30,
  },
  input: {
    height: 56,
    backgroundColor: '#0D1424',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#050914',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 22,
    padding: 8,
  },
  switchText: {
    color: '#8B9BB0',
    fontSize: 14,
  },
});