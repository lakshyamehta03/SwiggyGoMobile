import { View, Text, Pressable, ScrollView, ActivityIndicator } from '@/src/tw';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDetection } from '@/src/store/detection-store';
import { useInstamart } from '@/src/store/instamart-store';
import { ChevronDown, MapPin, ShoppingBag } from 'lucide-react-native';
import type { InstamartProduct } from '@/src/services/instamart';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { selectedProcessedResult } = useDetection();
  const { state: instamartState, setSelectedAddress, addItemToCart, refreshAddresses, refreshCart } = useInstamart();
  const insets = useSafeAreaInsets();

  const product = selectedProcessedResult?.metadata?.product as InstamartProduct | undefined;
  
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // ── Manual Triggers ─────────────────────────────────────────────
  
  // Refresh addresses when dropdown is opened
  useEffect(() => {
    if (showAddressDropdown) {
      refreshAddresses();
    }
  }, [showAddressDropdown, refreshAddresses]);

  if (!product) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-gray-400 text-6xl mb-4">🔍</Text>
        <Text className="text-gray-900 text-xl font-bold mb-2">Product not found</Text>
        <Text className="text-gray-500 text-center mb-6">We couldn't retrieve the details for this item.</Text>
        <Pressable 
          onPress={() => router.back()}
          className="px-8 py-3 rounded-xl bg-orange-500"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const variant = product.variations[selectedVariantIndex];
  const selectedAddress = instamartState.addresses.find(a => a.id === instamartState.selectedAddressId);

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
        <View className="flex-1">
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">Instamart</Text>
          <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>Product Details</Text>
        </View>
        
        {/* Address Selector */}
        <Pressable 
          onPress={() => setShowAddressDropdown(!showAddressDropdown)}
          className="flex-row items-center gap-1 bg-gray-50 px-3 py-2 rounded-full border border-gray-200"
        >
          <MapPin size={14} color="#FF6B35" />
          <Text className="text-gray-700 text-xs font-semibold max-w-[80px]" numberOfLines={1}>
            {selectedAddress?.tag || 'Select Address'}
          </Text>
          <ChevronDown size={14} color="#9ca3af" />
        </Pressable>
      </View>

      {/* Address Dropdown Overlay */}
      {showAddressDropdown && (
        <View className="absolute top-[72px] left-0 right-0 bg-white z-[100] shadow-2xl border-b border-gray-100 p-4">
          <Text className="text-gray-900 font-bold mb-3 px-1">Deliver to</Text>
          {instamartState.addresses.map((addr) => (
            <Pressable
              key={addr.id}
              onPress={() => {
                setSelectedAddress(addr.id);
                setShowAddressDropdown(false);
              }}
              className={`flex-row items-center gap-3 p-3 rounded-xl mb-1 ${
                instamartState.selectedAddressId === addr.id ? 'bg-orange-50 border border-orange-100' : 'bg-white'
              }`}
            >
              <View className={`w-8 h-8 rounded-full items-center justify-center ${
                instamartState.selectedAddressId === addr.id ? 'bg-orange-500' : 'bg-gray-100'
              }`}>
                <MapPin size={16} color={instamartState.selectedAddressId === addr.id ? '#fff' : '#6b7280'} />
              </View>
              <View className="flex-1">
                <Text className={`font-bold ${instamartState.selectedAddressId === addr.id ? 'text-orange-900' : 'text-gray-900'}`}>
                  {addr.tag}
                </Text>
                <Text className="text-gray-500 text-xs" numberOfLines={1}>{addr.line}</Text>
              </View>
              {instamartState.selectedAddressId === addr.id && (
                <View className="w-2 h-2 rounded-full bg-orange-500" />
              )}
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView contentContainerClassName="p-4 pb-32">
        {/* Product Image */}
        <View className="bg-orange-50 rounded-2xl p-4 mb-6 items-center justify-center aspect-square">
          {variant?.imageUrl ? (
             <Text className="text-[120px]">📦</Text> // Placeholder for real image if URL exists but we use emoji for demo
          ) : (
            <Text className="text-[120px]">🍎</Text>
          )}
        </View>

        {/* Product Info */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">{product.brand}</Text>
          <Text className="text-gray-900 text-2xl mb-3 font-bold">{product.name}</Text>

          <View className="flex-row items-center gap-3 mb-4">
            <Text className="text-gray-900 text-2xl font-bold">₹{variant?.price}</Text>
            {variant?.mrp > variant?.price && (
              <>
                <Text className="text-gray-500 line-through">₹{variant.mrp}</Text>
                <View className="px-3 py-1 rounded-full bg-green-100">
                  <Text className="text-green-700 text-sm font-medium">
                    {Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          <View className="self-start flex-row items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 border border-orange-200 shadow-sm">
            <Text className="text-lg">⚡</Text>
            <Text className="text-[#FF6B35] text-sm font-medium">Delivery in 15-20 mins</Text>
          </View>
        </View>

        {/* Variants */}
        <View className="mb-6">
          <Text className="text-gray-900 mb-3 font-semibold">Select Variation</Text>
          <View className="flex-row flex-wrap gap-3">
            {product.variations.map((v, index) => (
              <Pressable
                key={v.spinId}
                onPress={() => setSelectedVariantIndex(index)}
                className={`px-6 py-3 rounded-xl shadow-sm border ${
                  selectedVariantIndex === index
                    ? 'bg-[#FF6B35] border-[#FF6B35]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`font-medium ${selectedVariantIndex === index ? 'text-white' : 'text-gray-700'}`}>
                  {v.quantity}
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

          <Pressable 
            disabled={instamartState.isLoading || !variant?.isAvailable}
            onPress={() => variant && addItemToCart(variant.spinId, quantity)}
            className={`flex-1 py-4 rounded-xl shadow-md items-center justify-center flex-row gap-2 ${
              !variant?.isAvailable ? 'bg-gray-300' : 'bg-[#FF6B35]'
            }`}
          >
            {instamartState.isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <ShoppingBag size={20} color="#fff" />
                <Text className="text-white font-semibold text-lg">
                  {!variant?.isAvailable ? 'Out of Stock' : `Add to Cart · ₹${(variant?.price || 0) * quantity}`}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
