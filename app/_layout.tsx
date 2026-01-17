import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../lib/ui/toast';
import { useEffect, useState } from 'react';
import { getAccessToken } from '../lib/storage';
import { setAccessToken } from '../lib/api/auth.api';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = await getAccessToken();
      if (token) {
        setAccessToken(token);
        // If we are on the onboarding screen or auth stack, redirect to tabs
        // But to be safe, we just redirect to tabs if token exists
        // Check if we are already in tabs?
        // Let's just blindly replace if token exists and we are not in tabs
        // Actually, just checking token existence is enough for now.
        router.replace('/(tabs)');
      }
      setIsReady(true);
    }
    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Stack screenOptions={{headerShown: false}} >
          <Stack.Screen name='index' />
          <Stack.Screen name='(auth)' />
          <Stack.Screen name='(tabs)' />
        </Stack>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
