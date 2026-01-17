import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Bookings() {
  return (
    <SafeAreaView className="flex-1 bg-[#093275] items-center justify-center">
      <Text className="text-white text-xl font-bold">Bookings</Text>
    </SafeAreaView>
  );
}
