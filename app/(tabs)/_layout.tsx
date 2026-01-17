import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#093275',
          borderTopWidth: 0,
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: '#FACC15',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View className="items-center justify-center" style={{ minWidth: 50 }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
              <Text style={{ color, fontSize: 9, marginTop: 4, fontWeight: '500' }} numberOfLines={1}>HOME</Text>
            </View>
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size, focused }) => (
            <View className="items-center justify-center" style={{ minWidth: 70 }}>
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
              <Text style={{ color, fontSize: 9, marginTop: 4, fontWeight: '500' }} numberOfLines={1}>BOOKINGS</Text>
            </View>
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size, focused }) => (
            <View className="items-center justify-center" style={{ minWidth: 50 }}>
              <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
              <Text style={{ color, fontSize: 9, marginTop: 4, fontWeight: '500' }} numberOfLines={1}>WALLET</Text>
            </View>
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View className="items-center justify-center" style={{ minWidth: 50 }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
              <Text style={{ color, fontSize: 9, marginTop: 4, fontWeight: '500' }} numberOfLines={1}>PROFILE</Text>
            </View>
          ),
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  );
}
