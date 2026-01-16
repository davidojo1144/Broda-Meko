import { View, Text, Image, FlatList, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onboarding as onboardingData } from '../lib/Onboarding';
import { useRef, useState } from 'react';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setIndex(viewableItems[0].index ?? 0);
    }
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  return (
    <SafeAreaView className="flex-1 bg-[#093275]">
      <View className="flex-1">
        <FlatList
          data={onboardingData}
          keyExtractor={(_, i) => `onb-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <View style={{ width }} className="flex-1 items-center justify-center px-6">
              <Image source={item.img} style={{ width: wp(40), height: wp(40), resizeMode: 'contain' }} />
              <Text className="text-white text-3xl font-semibold text-center mt-10">{item.title}</Text>
              <Text className="text-gray-200 text-base text-center mt-3 px-4">{item.Description}</Text>
            </View>
          )}
        />
      </View>
      <View className="flex-row justify-center items-center mt-4">
        {onboardingData.map((_, i) => (
          <View key={`dot-${i}`} style={{ opacity: index === i ? 1 : 0.4 }} className="mx-1 w-2 h-2 rounded-full bg-gray-300" />
        ))}
      </View>
      <View className="w-full px-6 mt-6 mb-6">
        <TouchableOpacity
          onPress={() => {}}
          className="bg-yellow-400 rounded-lg h-12 items-center justify-center"
        >
          <Text className="text-black font-semibold">Create Account</Text>
        </TouchableOpacity>
        <View className="flex-row justify-center gap-2 mt-4">
          <Text className="text-white">Already have an account? </Text>
          <TouchableOpacity onPress={() => {}}>
            <Text className="text-yellow-400 font-semibold">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
