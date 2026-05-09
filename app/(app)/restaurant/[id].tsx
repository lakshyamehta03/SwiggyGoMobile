import { View, Text, Pressable, ScrollView } from '@/src/tw';
import { ArrowLeft, Share2, Star, Plus, Minus } from 'lucide-react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedTime, setSelectedTime] = useState('8:00 PM');
  const [guests, setGuests] = useState(2);
  const [selectedDate, setSelectedDate] = useState('Today');
  const insets = useSafeAreaInsets();

  const menuItems = [
    { name: 'Chicken Wings', price: 299, image: '🍗' },
    { name: 'Paneer Tikka', price: 249, image: '🧈' },
    { name: 'Veg Platter', price: 349, image: '🥗' },
  ];

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-32" bounces={false}>
        {/* Hero Image */}
        <View className="relative h-[220px] bg-orange-900 overflow-hidden">
          <View className="absolute inset-0 items-center justify-center bg-orange-800">
            <Text className="text-6xl">🍖</Text>
          </View>
          <View className="absolute inset-0 bg-black/40" />

          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 border border-white/40 items-center justify-center"
            style={{ marginTop: insets.top }}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </Pressable>

          <Pressable 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 border border-white/40 items-center justify-center"
            style={{ marginTop: insets.top }}
          >
            <Share2 size={20} color="#ffffff" />
          </Pressable>

          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-3xl mb-2 font-bold">Barbeque Nation</Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="px-3 py-1 rounded-full bg-white/20">
                <Text className="text-white text-xs font-medium">BBQ</Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-white/20">
                <Text className="text-white text-xs font-medium">North Indian</Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-white/20">
                <Text className="text-white text-xs font-medium">Buffet</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Row */}
        <View className="flex-row flex-wrap px-4 py-4 gap-2">
          <View className="flex-1 min-w-[70px] bg-gray-50 rounded-lg p-3 border border-gray-100">
            <View className="flex-row items-center gap-1 mb-1">
              <Star size={14} color="#00D4AA" fill="#00D4AA" />
              <Text className="text-[#00D4AA] text-sm font-semibold">4.3</Text>
            </View>
            <Text className="text-gray-500 text-xs">200 reviews</Text>
          </View>
          <View className="flex-1 min-w-[70px] bg-gray-50 rounded-lg p-3 border border-gray-100">
            <Text className="text-gray-900 text-sm mb-1 font-semibold">₹800</Text>
            <Text className="text-gray-500 text-xs">for two</Text>
          </View>
          <View className="flex-1 min-w-[70px] bg-gray-50 rounded-lg p-3 border border-gray-100">
            <Text className="text-gray-900 text-sm mb-1 font-semibold">1.2 km</Text>
            <Text className="text-gray-500 text-xs">away</Text>
          </View>
          <View className="flex-1 min-w-[70px] bg-gray-50 rounded-lg p-3 border border-gray-100">
            <Text className="text-green-600 text-sm mb-1 font-semibold">Open</Text>
            <Text className="text-gray-500 text-xs">until 11 PM</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 border-b border-gray-200">
          {['Overview', 'Menu', 'Offers', 'Book'].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setSelectedTab(tab.toLowerCase())}
              className="pb-3 mr-6 relative"
            >
              <Text className={`${
                selectedTab === tab.toLowerCase() ? 'text-gray-900 font-semibold' : 'text-gray-500'
              }`}>
                {tab}
              </Text>
              {selectedTab === tab.toLowerCase() && (
                <View className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D4AA]" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Menu Highlights */}
          <View className="mb-6">
            <Text className="text-gray-900 mb-3 font-semibold text-lg">Menu Highlights</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
              <View className="flex-row gap-3">
                {menuItems.map((item) => (
                  <View key={item.name} className="bg-white rounded-xl p-3 border border-gray-200 min-w-[140px] shadow-sm">
                    <Text className="text-4xl mb-2 text-center">{item.image}</Text>
                    <Text className="text-gray-900 text-sm mb-1 font-medium">{item.name}</Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-gray-700 text-sm">₹{item.price}</Text>
                      <Pressable className="w-6 h-6 rounded-full bg-[#00D4AA] items-center justify-center">
                        <Plus size={14} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Book a Table */}
          <View className="mb-6">
            <Text className="text-gray-900 mb-3 font-semibold text-lg">Book a Table</Text>

            {/* Date Selector */}
            <View className="flex-row gap-2 mb-4">
              {['Today', 'Tomorrow', 'Apr 30'].map((date) => (
                <Pressable
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedDate === date
                      ? 'bg-[#00D4AA] border-[#00D4AA]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`font-medium ${selectedDate === date ? 'text-white' : 'text-gray-700'}`}>
                    {date}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Time Slots */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              {['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'].map((time) => (
                <Pressable
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  className={`py-2 px-3 rounded-lg border ${
                    selectedTime === time
                      ? 'bg-[#00D4AA] border-[#00D4AA]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-sm ${selectedTime === time ? 'text-white font-medium' : 'text-gray-700'}`}>
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Guest Count */}
            <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4">
              <Text className="text-gray-900 font-medium">Guests</Text>
              <View className="flex-row items-center gap-4">
                <Pressable
                  onPress={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
                >
                  <Minus size={16} color="#374151" />
                </Pressable>
                <Text className="text-gray-900 w-6 text-center font-semibold">{guests}</Text>
                <Pressable
                  onPress={() => setGuests(guests + 1)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
                >
                  <Plus size={16} color="#374151" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
        style={{ paddingBottom: Math.max(insets.bottom + 16, 16) }}
      >
        <Pressable className="w-full py-4 rounded-2xl bg-[#00D4AA] items-center justify-center">
          <Text className="text-white font-semibold text-lg">
            Book Table · {selectedTime} · {guests} guests
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
