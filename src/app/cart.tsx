import React from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';

import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const router = useRouter();

  const {
    cart,
    totalItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
    checkout,
  } = useCart();

  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome5
            name="shopping-cart"
            size={60}
            color="#94a3b8"
          />

          <Text className="mt-6 text-2xl font-bold text-slate-800">
            Tu carrito está vacío
          </Text>

          <Text className="mt-3 text-center text-slate-500">
            Explora el catálogo para agregar
            artículos a tu pedido.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/')}
            className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 shadow-sm"
          >
            <Text className="font-semibold text-white">
              Explorar Catálogo
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center border-b border-slate-200 bg-white px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-slate-100"
        >
          <FontAwesome5
            name="arrow-left"
            size={16}
            color="#334155"
          />
        </TouchableOpacity>

        <View>
          <Text className="text-xl font-bold text-slate-800">
            Mi Carrito
          </Text>

          <Text className="text-sm text-slate-500">
            {totalItems}{' '}
            {totalItems === 1
              ? 'artículo'
              : 'artículos'}
          </Text>
        </View>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) =>
          item.product.id.toString()
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const itemTotal =
            item.product.price *
            item.quantity;

          return (
            <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
              <View className="flex-row">
                <View className="h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    source={{
                      uri: item.product.image,
                    }}
                    className="h-full w-full"
                    resizeMode="contain"
                  />
                </View>

                <View className="ml-4 flex-1">
                  <Text
                    className="font-semibold text-slate-800"
                    numberOfLines={2}
                  >
                    {item.product.title}
                  </Text>

                  <Text className="mt-1 text-sm text-slate-500">
                    $
                    {item.product.price.toFixed(
                      2
                    )}{' '}
                    unit.
                  </Text>

                  <View className="mt-3 flex-row items-center">
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(
                          item.product.id,
                          -1
                        )
                      }
                      className="h-8 w-8 items-center justify-center rounded-l-lg bg-slate-100"
                    >
                      <Text className="text-lg font-bold text-slate-700">
                        −
                      </Text>
                    </TouchableOpacity>

                    <View className="h-8 w-10 items-center justify-center bg-slate-50">
                      <Text className="font-semibold text-slate-700">
                        {item.quantity}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(
                          item.product.id,
                          1
                        )
                      }
                      className="h-8 w-8 items-center justify-center rounded-r-lg bg-slate-100"
                    >
                      <Text className="text-lg font-bold text-slate-700">
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="items-end justify-between">
                  <Text className="font-bold text-slate-800">
                    ${itemTotal.toFixed(2)}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      removeFromCart(
                        item.product.id
                      )
                    }
                    className="ml-2 p-2"
                  >
                    <FontAwesome5
                      name="trash-alt"
                      size={16}
                      color="#ef4444"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View className="border-t border-slate-200 bg-white px-5 py-5">
        <View className="mb-3 flex-row justify-between">
          <Text className="text-slate-600">
            Subtotal estimado
          </Text>

          <Text className="font-medium text-slate-800">
            ${cartTotal.toFixed(2)}
          </Text>
        </View>

        <View className="mb-3 flex-row justify-between">
          <Text className="text-slate-600">
            Envío
          </Text>

          <Text className="font-medium text-emerald-600">
            Gratis
          </Text>
        </View>

        <View className="mb-5 flex-row justify-between border-t border-slate-200 pt-3">
          <Text className="text-lg font-bold text-slate-800">
            Total a pagar
          </Text>

          <Text className="text-lg font-bold text-slate-800">
            ${cartTotal.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={checkout}
          className="flex-row items-center justify-center rounded-xl bg-emerald-600 py-4"
        >
          <FontAwesome5
            name="credit-card"
            size={16}
            color="#ffffff"
          />

          <Text className="ml-2 font-bold text-white">
            Proceder al Pago
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}