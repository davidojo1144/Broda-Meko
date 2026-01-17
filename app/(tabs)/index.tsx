import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getMe } from '../../lib/api/auth.api';
import { useToast } from '../../lib/ui/toast';

const { width } = Dimensions.get('window');

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { show } = useToast();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await getMe();
        if (res?.success || (res as any)?.status === 'success') {
          // Handle both structure variations just in case
          setUser(res.data?.user || (res as any)?.data);
        }
      } catch (e) {
        console.log('Failed to fetch user', e);
      }
    }
    fetchUser();
  }, []);

  // Extract first name from email if name is not available
  const displayName = user?.email ? user.email.split('@')[0] : 'User';
  // Capitalize first letter
  const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <SafeAreaView className="flex-1 bg-[#093275]" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden items-center justify-center">
              {user?.email ? (
                 <Text className="text-lg font-bold text-gray-700">{user.email.charAt(0).toUpperCase()}</Text>
              ) : (
                <Ionicons name="person" size={24} color="#555" />
              )}
            </View>
            <View>
              <Text className="text-yellow-400 text-xs font-bold">CURRENT LOCATION</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-white text-base">Victoria Island, Lagos</Text>
                <Ionicons name="chevron-down" size={16} color="white" />
              </View>
            </View>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-[#1e3a8a] items-center justify-center">
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View className="px-6 mt-4">
          <Text className="text-white text-3xl font-bold">
            Drive fearlessly, <Text className="text-yellow-400">{formattedName}.</Text>
          </Text>
          <Text className="text-gray-300 mt-2 text-base">
            Your 2022 Range Rover is in good health.
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-8 flex-row justify-between">
          {[
            { icon: 'construct-outline', label: 'Report Issue', color: 'text-yellow-400' },
            { icon: 'warning-outline', label: 'Emergency', color: 'text-yellow-400' },
            { icon: 'hardware-chip-outline', label: 'Spare parts', color: 'text-yellow-400' },
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              className="bg-[#1e3a8a] rounded-2xl p-4 w-[30%] h-32 justify-between"
            >
              <Ionicons name={item.icon as any} size={24} className={item.color} color="#FACC15" />
              <Text className="text-white font-medium">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workshops Nearby */}
        <View className="mt-8">
          <View className="px-6 flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-bold">Workshops Nearby</Text>
            <TouchableOpacity>
              <Text className="text-yellow-400 font-bold">VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {[1, 2].map((_, i) => (
              <View key={i} className="rounded-3xl overflow-hidden bg-white w-[300px] h-[380px] relative">
                {/* Map Placeholder */}
                <View className="flex-1 bg-gray-200 relative">
                    <Image 
                        source={{ uri: 'https://via.placeholder.com/300x380' }} 
                        className="w-full h-full absolute"
                    />
                    <View className="absolute top-1/2 left-1/2 -translate-x-4 -translate-y-4">
                        <View className="bg-yellow-400 px-3 py-1 rounded-full mb-1">
                            <Text className="text-xs font-bold">Main Hub</Text>
                        </View>
                        <Ionicons name="location" size={32} color="#FACC15" />
                    </View>
                </View>
                
                {/* Workshop Card Overlay */}
                <View className="absolute bottom-4 left-4 right-4 bg-[#0f172a] rounded-2xl p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-12 h-12 bg-gray-600 rounded-lg" />
                        <View>
                            <Text className="text-white font-bold">Lekki Certified Center</Text>
                            <Text className="text-gray-400 text-xs">4.9 (124 reviews) • 0.8km</Text>
                        </View>
                    </View>
                    <View className="bg-yellow-400 p-2 rounded-lg">
                        <Ionicons name="car-sport" size={20} color="black" />
                    </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View className="flex-row justify-center gap-2 mt-6 mb-10">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View 
                key={i} 
                className={`h-1.5 rounded-full ${i === activeSlide ? 'w-6 bg-white' : 'w-6 bg-gray-600'}`} 
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
