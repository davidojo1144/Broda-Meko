import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-red-900">
      <Ionicons name="home-outline" size={wp('12%')} color="#ffffff" />
      <Text className="text-white text-xl font-semibold">Home</Text>
    </View>
  );
}
