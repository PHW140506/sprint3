import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

interface ProductDetail {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : 1;

  const { role } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  const isAdmin = role === "admin";
  const isClient = role === "client" || (!isAdmin && role !== "auditor");

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    fetch(`https://fakestoreapi.com/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Producto no disponible");
        return res.json();
      })
      .then((data) => {
        if (!data || Object.keys(data).length === 0) {
          throw new Error("Producto no disponible");
        }
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        Alert.alert("Error", "Producto no disponible", [
          { text: "Aceptar", onPress: () => router.back() },
        ]);
      });
  }, [productId]);

  const handleDeletePress = () => {
    if (!isAdmin) {
      Alert.alert(
        "Acceso Denegado",
        "No cuentas con permisos para eliminar productos.",
      );
      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: executeDelete },
      ],
    );
  };

  const executeDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`https://fakestoreapi.com/products/${productId}`, {
        method: "DELETE",
      });

      const successMsg = "Producto eliminado correctamente (Simulación)";
      if (Platform.OS === "android") {
        ToastAndroid.show(successMsg, ToastAndroid.LONG);
      } else {
        Alert.alert("Éxito", successMsg);
      }
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el artículo.");
      setDeleting(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product as any, quantity);
    Alert.alert(
      "Carrito",
      `Se añadieron ${quantity} unidad(es) de "${product.title}" al carrito.`,
      [
        { text: "Seguir comprando", style: "cancel" },
        { text: "Ver Carrito", onPress: () => router.push("/cart" as any) },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando detalle del producto...</Text>
      </View>
    );
  }

  if (!product) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Producto</Text>
      </View>

      <Image source={{ uri: product.image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.category}>{product.category.toUpperCase()}</Text>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Experiencia para CLIENTE: Selector de cantidad y Agregar */}
        {isClient && (
          <View style={styles.clientActions}>
            <View style={styles.qtyContainer}>
              <Text style={styles.qtyLabel}>Cantidad:</Text>
              <View style={styles.qtySelector}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => q + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnAddCart}
              onPress={handleAddToCart}
            >
              <Ionicons name="cart" size={20} color="#ffffff" />
              <Text style={styles.btnAddCartText}>Añadir al carrito</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Experiencia para ADMINISTRADOR: Editar y Eliminar */}
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: "/edit-product" as any,
                  params: { id: product.id },
                })
              }
            >
              <Ionicons name="pencil" size={18} color="#ffffff" />
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, deleting && { opacity: 0.6 }]}
              onPress={handleDeletePress}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color="#ffffff" />
                  <Text style={styles.buttonText}>Eliminar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Experiencia para AUDITOR: Solo lectura */}
        {role === "auditor" && (
          <View style={styles.auditorBanner}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#d97706"
            />
            <Text style={styles.auditorText}>
              Perfil de Auditor: Información en modo solo lectura.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: "#ffffff",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: { marginTop: 10, color: "#64748b" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  btnBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  image: {
    width: "100%",
    height: 260,
    resizeMode: "contain",
    marginBottom: 20,
  },
  content: { flex: 1 },
  category: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: 6,
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 24,
  },
  clientActions: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
  },
  qtyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyLabel: { fontSize: 14, fontWeight: "600", color: "#475569" },
  qtySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "bold", color: "#334155" },
  qtyText: {
    width: 36,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
  },
  btnAddCart: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnAddCartText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
  adminActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
    paddingVertical: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#4f46e5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#e11d48",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
  auditorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 16,
  },
  auditorText: { fontSize: 13, color: "#92400e", fontWeight: "600", flex: 1 },
});
