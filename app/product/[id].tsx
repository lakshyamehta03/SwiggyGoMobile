import { View, Text, Pressable, ScrollView } from '@/src/tw';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [selectedVariant, setSelectedVariant] = useState('70g');
  const [quantity, setQuantity] = useState(1);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center gap-3 p-4 border-b border-gray-100 bg-white shadow-sm z-50">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={20} color="#1f2937" />
        </Pressable>
        <Text className="text-gray-900 flex-1 font-semibold text-lg">Product Details</Text>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-32">
        {/* Product Image */}
        <View className="bg-orange-50 rounded-2xl p-8 mb-6 items-center justify-center">
          <Text className="text-[80px]">🍜</Text>
        </View>

        {/* Product Info */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">Nestle</Text>
          <Text className="text-gray-900 text-2xl mb-3 font-bold">Maggi 2-Minute Masala Noodles</Text>

          <View className="flex-row items-center gap-3 mb-4">
            <Text className="text-gray-900 text-2xl font-bold">₹14</Text>
            <Text className="text-gray-500 line-through">₹16</Text>
            <View className="px-3 py-1 rounded-full bg-green-100">
              <Text className="text-green-700 text-sm font-medium">13% OFF</Text>
            </View>
          </View>

          <View className="self-start flex-row items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 border border-orange-200 shadow-sm">
            <Text className="text-lg">⚡</Text>
            <Text className="text-[#FF6B35] text-sm font-medium">Delivery in 10 mins</Text>
          </View>
        </View>

        {/* Variants */}
        <View className="mb-6">
          <Text className="text-gray-900 mb-3 font-semibold">Select Weight</Text>
          <View className="flex-row gap-3">
            {['70g', '140g', '280g'].map((variant) => (
              <Pressable
                key={variant}
                onPress={() => setSelectedVariant(variant)}
                className={`px-6 py-3 rounded-xl shadow-sm border ${
                  selectedVariant === variant
                    ? 'bg-[#FF6B35] border-[#FF6B35]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`font-medium ${selectedVariant === variant ? 'text-white' : 'text-gray-700'}`}>
                  {variant}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-gray-900 mb-2 font-semibold text-lg">Description</Text>
          <Text className="text-gray-600 text-sm leading-6">
            MAGGI 2-Minute Masala Noodles – your favourite snack made with the choicest quality spices and ingredients. Ready in just 2 minutes!
          </Text>
        </View>

        {/* Frequently Bought Together */}
        <View>
          <Text className="text-gray-900 mb-3 font-semibold text-lg">Frequently Bought Together</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-xl p-3 border border-gray-200 shadow-sm items-center">
              <Text className="text-4xl mb-2">🥤</Text>
              <Text className="text-gray-900 text-sm mb-1 font-medium">Coca Cola</Text>
              <Text className="text-gray-700 text-xs">₹20</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-3 border border-gray-200 shadow-sm items-center">
              <Text className="text-4xl mb-2">🍪</Text>
              <Text className="text-gray-900 text-sm mb-1 font-medium">Oreo Cookies</Text>
              <Text className="text-gray-700 text-xs">₹30</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
        style={{ paddingBottom: Math.max(insets.bottom + 16, 16) }}
      >
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-2 border border-gray-200">
            <Pressable
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg bg-white shadow-sm items-center justify-center"
            >
              <Minus size={16} color="#374151" />
            </Pressable>
            <Text className="text-gray-900 w-8 text-center font-semibold text-lg">{quantity}</Text>
            <Pressable
              onPress={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg bg-white shadow-sm items-center justify-center"
            >
              <Plus size={16} color="#374151" />
            </Pressable>
          </View>

          <Pressable className="flex-1 py-4 rounded-xl bg-[#FF6B35] shadow-md items-center justify-center">
            <Text className="text-white font-semibold text-lg">
              Add to Cart · ₹{14 * quantity}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
