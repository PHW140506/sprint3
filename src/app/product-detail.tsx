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
import {
    deleteProduct,
    getProductById,
    ProductResponse,
} from "../services/productService";

// Simulación de rol activo (para probar: 'admin', 'client' o 'auditor')
const CURRENT_USER_ROLE: "admin" | "client" | "auditor" = "admin";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : 1;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      try {
        const data = await getProductById(productId);
        if (isMounted) setProduct(data);
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar la información del producto.", [
          { text: "Aceptar", onPress: () => router.back() },
        ]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // US08 Escenario 1 y 2: Cuadro de diálogo de confirmación obligatoria
  const handleDeletePress = () => {
    // Escenario 3: Bloqueo a nivel de código
    if (CURRENT_USER_ROLE !== "admin") {
      Alert.alert(
        "Acceso Denegado",
        "No cuentas con permisos para eliminar productos.",
      );
      return;
    }

    Alert.alert(
      "¿Eliminar producto?",
      `¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.`,
      [
        {
          // Escenario 2: Cancelación sin peticiones de red
          text: "Cancelar",
          style: "cancel",
        },
        {
          // Escenario 1: Confirmación de eliminación
          text: "Sí, Eliminar",
          style: "destructive",
          onPress: executeDelete,
        },
      ],
    );
  };

  const executeDelete = async () => {
    setDeleting(true);
    try {
      // Consumo HTTP DELETE /products/{id}
      await deleteProduct(productId);

      // Toast nativo en Android o Alert en otras plataformas
      const successMsg = "Producto eliminado del catálogo (Simulación)";
      if (Platform.OS === "android") {
        ToastAndroid.show(successMsg, ToastAndroid.LONG);
      } else {
        Alert.alert("Éxito", successMsg);
      }

      // Redirigir inmediatamente al catálogo general
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "No se pudo completar la eliminación del artículo.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando detalle del producto...</Text>
      </View>
    );
  }

  if (!product) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Producto</Text>
      </View>

      {/* Imagen */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Información */}
      <View style={styles.detailsCard}>
        <Text style={styles.categoryBadge}>
          {product.category.toUpperCase()}
        </Text>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* US08 Escenario 3: Renderizado condicional exclusivo para Administrador */}
        {CURRENT_USER_ROLE === "admin" && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={[styles.btnDelete, deleting && styles.btnDisabled]}
              onPress={handleDeletePress}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.btnDeleteText}>
                    Eliminar Producto (DELETE)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  contentContainer: { padding: 16, paddingTop: 48, paddingBottom: 32 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: { marginTop: 10, fontSize: 13, color: "#64748b" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  btnBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerTitle: { fontSize: 17, fontWeight: "bold", color: "#0f172a" },
  imageContainer: {
    height: 220,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  image: { width: "100%", height: "100%" },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4f46e5",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#0f172a", lineHeight: 22 },
  price: { fontSize: 20, fontWeight: "900", color: "#0f172a", marginTop: 8 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 14 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 6,
  },
  description: { fontSize: 13, color: "#475569", lineHeight: 20 },
  adminActions: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 16,
  },
  btnDelete: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    paddingVertical: 13,
    borderRadius: 14,
  },
  btnDisabled: { opacity: 0.7 },
  btnDeleteText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
});
