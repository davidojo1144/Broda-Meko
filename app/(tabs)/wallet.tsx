import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';

export default function Wallet() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');

  return (
    <SafeAreaView className="flex-1 bg-[#093275]">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="px-6 py-4 flex-row items-center gap-2">
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg">Back</Text>
        </View>

        <ScrollView className="flex-1 px-6">
            <Text className="text-white text-3xl font-semibold mt-4">Enter Amount</Text>
            
            <View className="mt-6 mb-10 relative">
                <Text className="text-yellow-400 text-4xl absolute left-0 top-3">₦</Text>
                <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    className="text-white text-5xl font-bold pl-8 pb-2"
                    placeholder="0"
                    placeholderTextColor="#4b5563"
                    autoFocus
                />
            </View>

            <Text className="text-white text-xl font-semibold mb-6">Payment Method</Text>

            <View className="gap-4">
                {/* Saved Card */}
                <Pressable 
                    onPress={() => setSelectedMethod('card')}
                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${selectedMethod === 'card' ? 'border-yellow-400 bg-[#1e3a8a]/50' : 'border-[#1e3a8a] bg-[#1e3a8a]/30'}`}
                >
                    <View className="flex-row items-center gap-4">
                        <View className="w-12 h-12 rounded-full border border-yellow-400 items-center justify-center">
                            <Ionicons name="card" size={24} color="#FACC15" />
                        </View>
                        <View>
                            <Text className="text-white font-semibold text-lg">Saved Card</Text>
                            <Text className="text-gray-400">Mastercard •••• 1234</Text>
                        </View>
                    </View>
                    {selectedMethod === 'card' ? (
                        <View className="w-6 h-6 rounded-full bg-yellow-400 items-center justify-center">
                            <Ionicons name="checkmark" size={16} color="black" />
                        </View>
                    ) : (
                        <View className="w-6 h-6 rounded-full border border-gray-500" />
                    )}
                </Pressable>

                {/* Bank Transfer */}
                <Pressable 
                    onPress={() => setSelectedMethod('bank')}
                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${selectedMethod === 'bank' ? 'border-yellow-400 bg-[#1e3a8a]/50' : 'border-[#1e3a8a] bg-[#1e3a8a]/30'}`}
                >
                    <View className="flex-row items-center gap-4">
                        <View className="w-12 h-12 rounded-full border border-gray-500 items-center justify-center">
                            <Ionicons name="business" size={24} color="#9CA3AF" />
                        </View>
                        <View>
                            <Text className="text-white font-semibold text-lg">Bank Transfer</Text>
                            <Text className="text-gray-400">Instant settlement</Text>
                        </View>
                    </View>
                    {selectedMethod === 'bank' ? (
                        <View className="w-6 h-6 rounded-full bg-yellow-400 items-center justify-center">
                            <Ionicons name="checkmark" size={16} color="black" />
                        </View>
                    ) : (
                        <View className="w-6 h-6 rounded-full border border-gray-500" />
                    )}
                </Pressable>

                {/* Digital Wallet */}
                <Pressable 
                    onPress={() => setSelectedMethod('digital')}
                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${selectedMethod === 'digital' ? 'border-yellow-400 bg-[#1e3a8a]/50' : 'border-[#1e3a8a] bg-[#1e3a8a]/30'}`}
                >
                    <View className="flex-row items-center gap-4">
                        <View className="w-12 h-12 rounded-full border border-gray-500 items-center justify-center">
                            <Ionicons name="wallet" size={24} color="#9CA3AF" />
                        </View>
                        <View>
                            <Text className="text-white font-semibold text-lg">Digital Wallet</Text>
                            <Text className="text-gray-400">Apple Pay / Google Pay</Text>
                        </View>
                    </View>
                    {selectedMethod === 'digital' ? (
                        <View className="w-6 h-6 rounded-full bg-yellow-400 items-center justify-center">
                            <Ionicons name="checkmark" size={16} color="black" />
                        </View>
                    ) : (
                        <View className="w-6 h-6 rounded-full border border-gray-500" />
                    )}
                </Pressable>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
