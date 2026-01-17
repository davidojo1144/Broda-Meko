import { View, Text, Pressable, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { requestOtp, verifyOtp } from '../../lib/api/auth.api';
import { router, useLocalSearchParams } from 'expo-router';
import { useToast } from '../../lib/ui/toast';

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [verifying, setVerifying] = useState(false);
  const [codeDigits, setCodeDigits] = useState<string[]>(['','','','','','']);
  const inputs = useRef<Array<any>>([]);
  const [countdown, setCountdown] = useState<number>(45);
  const { show } = useToast();

  useEffect(() => {
    if (!email) {
        show("No email provided", 'error');
        router.back();
        return;
    }
    setCountdown(45);
    const id = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [email]);

  async function handleResend() {
     if (!email) return;
     try {
         const res = await requestOtp(email);
         if (res?.success) {
             show('OTP sent successfully', 'success');
             setCountdown(Math.min(60, Math.max(30, Math.floor(res.data?.expiresIn ? res.data.expiresIn / 6 : 45))));
         }
     } catch (e) {
        const msg = (e as any)?.response?.data?.message || 'Failed to resend OTP';
        show(msg, 'error');
     }
  }

  async function handleVerify() {
    const code = codeDigits.join('');
    if (code.length < 4) return;
    try {
      setVerifying(true);
      const payload = { email: email!, otp: code };
      console.log('[OTP] verify payload', payload);
      const res = await verifyOtp(payload);
      if (res?.success) {
        console.log('[OTP] verify success', res?.message ?? 'Authentication successful', res);
        show('Authentication successful', 'success');
        router.replace('/(tabs)');
      }
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || 'Invalid or expired code';
      console.log('[OTP] verify error', msg, (e as any)?.response?.data || e);
      show(msg, 'error');
    } finally {
      setVerifying(false);
    }
  }

  function updateDigit(index: number, value: string) {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, '').slice(0, 6).split('');
      const next = [...codeDigits];
      for (let i = 0; i < 6; i++) next[i] = chars[i] || '';
      setCodeDigits(next);
      const nextEmpty = next.findIndex((d) => d === '');
      if (nextEmpty >= 0) inputs.current[nextEmpty]?.focus();
      else inputs.current[5]?.blur();
      return;
    }
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const next = [...codeDigits];
    next[index] = digit;
    setCodeDigits(next);
    if (digit) {
      if (index < 5) inputs.current[index + 1]?.focus();
      else inputs.current[index]?.blur();
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
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

        <View className="flex-1 px-6 mt-6">
            <Text className="text-white text-2xl font-semibold">Verify Your Email</Text>
            <Text className="text-gray-200 mt-2">
              Enter the verification code sent to{' '}
              <Text className="text-white font-semibold">{email}</Text>.
            </Text>

            <View className="flex-row justify-between mt-8">
              {[0,1,2,3,4,5].map((i) => (
                <TextInput
                  key={`d-${i}`}
                  ref={(el) => (inputs.current[i] = el)}
                  value={codeDigits[i]}
                  onChangeText={(v) => updateDigit(i, v)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
                  keyboardType="number-pad"
                  className="w-12 h-12 rounded-md bg-[#173b78] text-white text-center"
                  maxLength={6}
                />
              ))}
            </View>

            <View className="mt-4">
              {countdown > 0 ? (
                <Text className="text-gray-200">
                  Didn’t receive the code? <Text className="text-yellow-400">Resend in {countdown}s</Text>
                </Text>
              ) : (
                <Pressable onPress={handleResend}>
                  <Text className="text-yellow-400">Resend code</Text>
                </Pressable>
              )}
            </View>

            <View className="mt-auto mb-6">
              <TouchableOpacity
                disabled={verifying}
                onPress={handleVerify}
                className="bg-yellow-400 rounded-lg h-12 items-center justify-center"
              >
                {verifying ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-semibold">Verify Number</Text>
                )}
              </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
