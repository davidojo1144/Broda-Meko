import { View, Text, Pressable, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { requestOtp } from '../../lib/api/auth.api';
import { router } from 'expo-router';
import { useToast } from '../../lib/ui/toast';

export default function RequestOtp() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const { show } = useToast();

  async function handleSend() {
    if (!email || !email.includes('@')) {
        show('Please enter a valid email address', 'error');
        return;
    }
    try {
      setSending(true);
      const payload = { email, userType: 'owner' };
      console.log('[OTP] request payload', payload);
      // Pass the object so auth.api.ts stringifies it correctly or handles it
      const res = await requestOtp(email);
      console.log('[OTP] raw response:', JSON.stringify(res, null, 2));
      
      // Check for success property or if data exists (some APIs return just data on success)
      if (res?.success || (res?.data && !res.error)) {
        console.log('[OTP] request success, navigating...');
        show('OTP sent successfully', 'success');
        
        // Use simpler navigation with string path
        const targetPath = `/(auth)/verify-email?email=${encodeURIComponent(email)}&expiresIn=${res.data?.expiresIn || 300}`;
        console.log('[OTP] navigating to:', targetPath);
        
        // Use replace instead of push if we want to prevent going back to request form easily, 
        // but push is fine. Using setTimeout to ensure state updates clear first.
        setTimeout(() => {
            router.push(targetPath as any);
        }, 100);
      } else {
        console.log('[OTP] response indicated failure:', res);
        show(res?.message || 'Failed to send OTP', 'error');
      }
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || 'Failed to send OTP';
      console.log('[OTP] request error', msg, (e as any)?.response?.data || e);
      show(msg, 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#093275]">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={24}>
        <View className="px-6 pt-6">
          <Text className="text-white text-center pb-10 text-3xl font-bold">BrodaMeko</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-white mt-2">{'<  Back'}</Text>
          </Pressable>
        </View>

        <View className="flex-1 px-6 mt-2">
            <Text className="text-white text-2xl font-semibold">Get Started in Seconds</Text>
            <Text className="text-gray-200 mt-2">
              Enter your email. We'll send a one-time code to verify your account.
            </Text>

            <Text className="text-white mt-6 mb-2">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              className="h-12 rounded-md bg-[#173b78] px-4 text-white"
              placeholder="Enter email address"
              placeholderTextColor="#93a4c9"
              returnKeyType="done"
              autoCapitalize="none"
            />

            <View className="mt-auto mb-6">
              <TouchableOpacity
                disabled={sending}
                onPress={handleSend}
                className="bg-yellow-400 rounded-lg h-12 items-center justify-center"
              >
                {sending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-semibold">Create Account</Text>
                )}
              </TouchableOpacity>
              <View className="flex-row justify-center mt-4">
                <Text className="text-white">Already have an account? </Text>
                <Pressable onPress={() => {}}>
                  <Text className="text-yellow-400 font-semibold">Sign in</Text>
                </Pressable>
              </View>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
