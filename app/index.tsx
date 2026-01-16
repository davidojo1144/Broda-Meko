import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#093275]" >
      <View style={{ padding: wp(3) }}>
        <Ionicons name="home-outline" size={wp('12%')} color="#ffffff" />
        <Text className="text-white text-xl font-semibold">Home</Text>
      </View>
    </SafeAreaView >
  );
}
