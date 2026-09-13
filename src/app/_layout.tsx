import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}