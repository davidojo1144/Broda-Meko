import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getMe, logout } from '../../lib/api/auth.api';
import { clearAuthTokens } from '../../lib/storage';
import { router } from 'expo-router';
import { useToast } from '../../lib/ui/toast';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const { show } = useToast();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await getMe();
        if (res?.success || (res as any)?.status === 'success') {
          setUser(res.data?.user || (res as any)?.data);
        }
      } catch (e) {
        console.log('Failed to fetch user', e);
      }
    }
    fetchUser();
  }, []);

  async function handleLogout() {
    try {
        // Try to call api logout but don't block if it fails
        await logout().catch(e => console.log('Logout API failed', e));
    } catch(e) {}
    
    await clearAuthTokens();
    show('Logged out successfully', 'success');
    // Navigate to request otp screen
    router.replace('/(auth)/otp');
  }

  // Extract name and first letter
  const displayName = user?.email ? user.email.split('@')[0] : 'User';
  // Capitalize each word
  const formattedName = displayName.split('.').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const email = user?.email || 'user@example.com';

  const menuItems = [
    { title: 'PERSONAL INFO', items: [
        { icon: 'person-outline', label: 'Profile Details' },
        { icon: 'shield-checkmark-outline', label: 'Password & Security' }
    ]},
    { title: 'VEHICLES', items: [
        { icon: 'car-sport-outline', label: 'My Garage' },
        { icon: 'time-outline', label: 'Maintenance History' }
    ]},
    { title: 'WALLET SETTINGS', items: [
        { icon: 'card-outline', label: 'Payment Methods' },
        { icon: 'receipt-outline', label: 'Transaction History' }
    ]},
    { title: 'APP PREFERENCES', items: [
        { icon: 'notifications-outline', label: 'Notification Settings' },
        { icon: 'globe-outline', label: 'Language' },
        { icon: 'location-outline', label: 'Location Permissions' }
    ]}
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#093275]" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center mt-6 mb-8">
            <View className="w-24 h-24 rounded-full border-2 border-yellow-400 p-1 mb-3">
                <View className="w-full h-full rounded-full bg-gray-300 overflow-hidden items-center justify-center">
                    {user?.email ? (
                        <Text className="text-4xl font-bold text-gray-700">{user.email.charAt(0).toUpperCase()}</Text>
                    ) : (
                        <Image source={{ uri: 'https://via.placeholder.com/100' }} className="w-full h-full" />
                    )}
                </View>
            </View>
            <Text className="text-white text-xl font-bold">{formattedName}</Text>
            <Text className="text-gray-400">{email}</Text>
        </View>

        {/* Menu Sections */}
        <View className="px-6 pb-10">
            {menuItems.map((section, sIndex) => (
                <View key={sIndex} className="mb-6">
                    <Text className="text-yellow-400 font-bold text-xs mb-3 tracking-wider">{section.title}</Text>
                    <View>
                        {section.items.map((item, iIndex) => (
                            <TouchableOpacity key={iIndex} className="flex-row items-center justify-between py-4 border-b border-[#1e3a8a]">
                                <View className="flex-row items-center gap-4">
                                    <View className="w-8 items-center">
                                        <Ionicons name={item.icon as any} size={22} color="white" />
                                    </View>
                                    <Text className="text-white text-base">{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#64748b" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}

            <TouchableOpacity 
                onPress={handleLogout}
                className="mt-4 border border-yellow-400 rounded-full py-4 items-center"
            >
                <Text className="text-yellow-400 font-bold tracking-widest">LOG OUT</Text>
            </TouchableOpacity>

            <TouchableOpacity className="mt-6 items-center mb-10">
                <Text className="text-red-500">Account Deletion</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
