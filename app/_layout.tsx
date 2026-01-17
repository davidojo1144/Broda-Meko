import '../global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../lib/ui/toast';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Stack screenOptions={{headerShown: false}} >
          <Stack.Screen name='index' />
          <Stack.Screen name='(auth)' />
        </Stack>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
