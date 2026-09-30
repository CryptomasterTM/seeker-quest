import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const REFERRAL_KEY = 'seeker_referral_code';

export default function RewardsScreen() {
  const [referralCode, setReferralCode] = useState('CRYPTOMASTER');
  const [referrals, setReferrals] = useState(0);

  useEffect(() => {
    loadReferral();
  }, []);

  async function loadReferral() {
    const saved = await AsyncStorage.getItem(REFERRAL_KEY);

    if (saved) {
      setReferralCode(saved);
    } else {
      await AsyncStorage.setItem(REFERRAL_KEY, 'CRYPTOMASTER');
    }
  }

  const referralLink = `https://dist-eight-blue-69.vercel.app/?ref=${referralCode}`;

  async function copyReferral() {
    await Clipboard.setStringAsync(referralLink);
    Alert.alert('Copied!', 'Your Seeker referral link is ready to share.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>SKR</Text>
      <Text style={styles.title}>SEEKER REWARDS</Text>
      <Text style={styles.subtitle}>
        Invite, explore and unlock more from THE SEEKER.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>INVITE FRIENDS</Text>
        <Text style={styles.cardTitle}>Grow the Seeker community</Text>
        <Text style={styles.description}>
          Share your referral link and track the people who join through you.
        </Text>

        <View style={styles.statRow}>
          <View>
            <Text style={styles.statValue}>{referrals}</Text>
            <Text style={styles.statLabel}>Friends Joined</Text>
          </View>

          <View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Rewards Earned</Text>
          </View>
        </View>

        <View style={styles.linkBox}>
          <Text style={styles.linkText} numberOfLines={1}>
            {referralLink}
          </Text>
        </View>

        <Pressable style={styles.button} onPress={copyReferral}>
          <Text style={styles.buttonText}>COPY REFERRAL LINK</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>HOLD SKR</Text>
        <Text style={styles.cardTitle}>Your SKR journey</Text>
        <Text style={styles.description}>
          Connect your wallet to track your SKR holdings and eligible Seeker
          benefits.
        </Text>

        <View style={styles.lockRow}>
          <Text style={styles.lockIcon}>SKR</Text>
          <Text style={styles.lockText}>Wallet required</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>SEEKER PHONE</Text>
        <Text style={styles.cardTitle}>Built for the Seeker ecosystem</Text>
        <Text style={styles.description}>
          Keep your Seeker Phone connected to unlock any supported ecosystem
          features and achievements.
        </Text>

        <View style={styles.lockRow}>
          <Text style={styles.lockIcon}>◈</Text>
          <Text style={styles.lockText}>Eligibility tracking coming soon</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>REFERRAL ACTIVITY</Text>
        <Text style={styles.emptyTitle}>No referrals yet</Text>
        <Text style={styles.description}>
          Your referral activity will appear here once friends start joining.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#070816',
    flexGrow: 1,
  },
  logo: {
    color: '#7C6CFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#8D91A8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#101225',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#242847',
  },
  cardLabel: {
    color: '#7C6CFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 7,
  },
  description: {
    color: '#9297B1',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 45,
    marginTop: 18,
    marginBottom: 15,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#777C96',
    fontSize: 11,
    marginTop: 2,
  },
  linkBox: {
    backgroundColor: '#080A17',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: '#292E50',
  },
  linkText: {
    color: '#A9ADCB',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#6C5CE7',
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  lockIcon: {
    color: '#7C6CFF',
    fontWeight: '900',
  },
  lockText: {
    color: '#A1A5BD',
    fontSize: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
  },
});
