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
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      Alert.alert(
        'Missing information',
        'Enter your email and password.',
      );
      return;
    }

    if (isSignUp && !username.trim()) {
      Alert.alert(
        'Missing username',
        'Choose a username for your Seeker profile.',
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Password too short',
        'Your password must be at least 6 characters.',
      );
      return;
    }

    setLoading(true);

    try {
      const result = isSignUp
        ? await signUp(
            cleanEmail,
            password,
            username.trim(),
          )
        : await signIn(
            cleanEmail,
            password,
          );

      if (result.error) {
        console.log(
          'AUTH ERROR:',
          result.error.message,
          result.error.code,
        );

        const message =
          result.error.code === 'invalid_credentials'
            ? 'The email or password is incorrect. If you are new to THE SEEKER, create an account first or reset your password.'
            : result.error.message;

        Alert.alert(
          isSignUp ? 'Account creation failed' : 'Login failed',
          message,
        );

        return;
      }      if (isSignUp && !result.data.session) {
        const loginResult = await signIn(
          cleanEmail,
          password,
        );

        if (loginResult.error || !loginResult.data.session) {
          Alert.alert(
            'Account created',
            loginResult.error?.message ??
              'Your account was created. Please sign in with the same email and password.',
          );

          setIsSignUp(false);
          return;
        }

        router.replace('/home');
        return;
      }

      router.replace('/home');
    } catch (error) {
      console.log('AUTH EXCEPTION:', error);

      Alert.alert(
        'Something went wrong',
        'We could not complete your request. Please check your internet connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      Alert.alert(
        'Enter your email',
        'Enter the email connected to your Seeker account first.',
      );
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
        );

      if (error) {
        console.log(
          'PASSWORD RESET ERROR:',
          error.message,
          error.code,
        );

        Alert.alert(
          'Reset failed',
          error.message,
        );

        return;
      }

      Alert.alert(
        'Reset email sent',
        'If an account exists for this email, check your inbox for instructions to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsForgotPassword(false);
              setIsSignUp(false);
            },
          },
        ],
      );
    } catch (error) {
      console.log(
        'PASSWORD RESET EXCEPTION:',
        error,
      );

      Alert.alert(
        'Something went wrong',
        'We could not send the reset email. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsForgotPassword(false);
    setIsSignUp((value) => !value);
    setPassword('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.glow} />

      <View style={styles.content}>
        <Text style={styles.brand}>
          THE SEEKER
        </Text>

        {isForgotPassword ? (
          <>
            <Text style={styles.title}>
              Reset your password.
            </Text>

            <Text style={styles.subtitle}>
              Enter your email and we'll send
              you instructions to create a new
              password.
            </Text>

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

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed &&
                  styles.buttonPressed,
                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#050914"
                />
              ) : (
                <Text style={styles.buttonText}>
                  SEND RESET EMAIL
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.switchButton}
              onPress={() => {
                setIsForgotPassword(false);
                setIsSignUp(false);
              }}
            >
              <Text style={styles.switchText}>
                Back to sign in
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              {isSignUp
                ? 'Create your Seeker identity.'
                : 'Welcome back.'}
            </Text>

            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Explore the ecosystem, complete quests, play games and build your reputation.'
                : 'Continue your journey across THE SEEKER.'}
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
              autoComplete={
                isSignUp
                  ? 'new-password'
                  : 'password'
              }
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed &&
                  styles.buttonPressed,
                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#050914"
                />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp
                    ? 'CREATE ACCOUNT'
                    : 'SIGN IN'}
                </Text>
              )}
            </Pressable>

            {!isSignUp && (
              <Pressable
                style={styles.forgotButton}
                onPress={() =>
                  setIsForgotPassword(true)
                }
              >
                <Text style={styles.forgotText}>
                  Forgot password?
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.switchButton}
              onPress={switchMode}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : 'New to THE SEEKER? Create an account'}
              </Text>
            </Pressable>
          </>
        )}
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
    transform: [
      {
        scale: 0.98,
      },
    ],
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

  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 6,
  },

  forgotText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '700',
  },

  switchButton: {
    alignItems: 'center',
    marginTop: 18,
    padding: 8,
  },

  switchText: {
    color: '#8B9BB0',
    fontSize: 14,
    textAlign: 'center',
  },
});

