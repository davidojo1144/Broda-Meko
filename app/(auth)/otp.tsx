import { View, Text, Pressable, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { requestOtp, verifyOtp } from '../../lib/api/auth.api';
import { router } from 'expo-router';


export default function Otp (){

  const [step, setStep] = useState<'request'|'verify'>('request');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeDigits, setCodeDigits] = useState<string[]>(['','','','','','']);
  const inputs = useRef<Array<any>>([]);
  const [countdown, setCountdown] = useState<number>(45);

  useEffect(() => {
    if (step !== 'verify') return;
    setCountdown(45);
    const id = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  function normalizePhone(input: string) {
    const trimmed = input.replace(/\s+/g, '');
    if (trimmed.startsWith('+234')) return trimmed.slice(4);
    if (trimmed.startsWith('234')) return trimmed.slice(3);
    if (trimmed.startsWith('0')) return trimmed.slice(1);
    return trimmed;
  }

  async function handleSend() {
    const normalized = normalizePhone(phone);
    if (!normalized || normalized.length < 10) return;
    try {
      setSending(true);
      const res = await requestOtp(normalized);
      if (res?.success) {
        setStep('verify');
        setCodeDigits(['','','','','','']);
        inputs.current[0]?.focus();
        if (res.data?.expiresIn) {
          setCountdown(Math.min(60, Math.max(30, Math.floor(res.data.expiresIn / 6))));
        }
      }
    } catch (e) {
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    const code = codeDigits.join('');
    if (code.length !== 6) return;
    try {
      setVerifying(true);
      const res = await verifyOtp({ phoneNumber: normalizePhone(phone), otp: code });
      if (res?.success) {
        router.replace('/');
      }
    } catch (e) {
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
          <Text className="text-white text-2xl font-bold">BrodaMeko</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-white mt-2">{'< Back'}</Text>
          </Pressable>
        </View>

        {step === 'request' && (
          <View className="flex-1 px-6 mt-6">
            <Text className="text-white text-2xl font-semibold">Get Started in Seconds</Text>
            <Text className="text-gray-200 mt-2">
              Enter your phone number to get started. We'll send a one-time code to verify your account.
            </Text>

            <Text className="text-white mt-6 mb-2">Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="h-12 rounded-md bg-[#173b78] px-4 text-white"
              placeholder="Enter phone number"
              placeholderTextColor="#93a4c9"
              returnKeyType="done"
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
        )}

        {step === 'verify' && (
          <View className="flex-1 px-6 mt-6">
            <Text className="text-white text-2xl font-semibold">Verify Your Phone Number</Text>
            <Text className="text-gray-200 mt-2">
              Enter the verification code sent to{' '}
              <Text className="text-white font-semibold">+234 {normalizePhone(phone)}</Text> to secure your account.
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
                <Pressable onPress={handleSend}>
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
