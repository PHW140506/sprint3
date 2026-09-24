import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    Alert.alert(
      "¡Compra Completada!",
      `Se ha registrado tu compra por un monto de $${cartTotal.toFixed(2)}. Pedido procesado con éxito.`,
      [
        {
          text: "Aceptar",
          onPress: () => {
            checkout();
            router.replace("/");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabecera */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Mi Carrito</Text>
            <Text style={styles.headerSubtitle}>
              {totalItems} artículo{totalItems === 1 ? "" : "s"}
            </Text>
          </View>
        </View>

        {/* Estado Vacío */}
        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={48} color="#10b981" />
            </View>
            <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptySubtitle}>
              Explora el catálogo para agregar artículos a tu pedido.
            </Text>
            <TouchableOpacity
              style={styles.btnExplore}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.btnExploreText}>Explorar Catálogo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Lista de productos en el carrito */}
            <FlatList
              data={cart}
              keyExtractor={(item) => item.product.id.toString()}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const itemTotal = item.product.price * item.quantity;
                return (
                  <View style={styles.card}>
                    <Image
                      source={{ uri: item.product.image }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {item.product.title}
                      </Text>
                      <Text style={styles.productPrice}>
                        ${item.product.price.toFixed(2)} unit.
                      </Text>

                      <View style={styles.rowControls}>
                        {/* Selector de cantidad */}
                        <View style={styles.qtyBox}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.product.id, -1)}
                          >
                            <Text style={styles.qtyBtnText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.product.id, 1)}
                          >
                            <Text style={styles.qtyBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.itemTotal}>
                          ${itemTotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Botón Eliminar */}
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeFromCart(item.product.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />

            {/* Footer con resumen de pago */}
            <View style={styles.footer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal estimado</Text>
                <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.freeShipping}>Gratis</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total a pagar</Text>
                <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={styles.btnCheckout}
                onPress={handleCheckout}
              >
                <Ionicons name="card-outline" size={20} color="#ffffff" />
                <Text style={styles.btnCheckoutText}>Proceder al Pago</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  headerSubtitle: { fontSize: 12, color: "#64748b" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 240,
    marginBottom: 20,
  },
  btnExplore: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnExploreText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  productImage: {
    width: 64,
    height: 64,
    resizeMode: "contain",
    marginRight: 12,
  },
  productInfo: { flex: 1 },
  productTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "bold",
    marginBottom: 8,
  },
  rowControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 16, fontWeight: "bold", color: "#334155" },
  qtyText: {
    width: 28,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  itemTotal: { fontSize: 14, fontWeight: "bold", color: "#0f172a" },
  deleteBtn: { padding: 8, marginLeft: 8 },
  footer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 13, color: "#64748b" },
  summaryValue: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  freeShipping: { fontSize: 13, fontWeight: "bold", color: "#10b981" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  totalLabel: { fontSize: 15, fontWeight: "bold", color: "#0f172a" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#10b981" },
  btnCheckout: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnCheckoutText: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
});
