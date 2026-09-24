import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const { canAccessUsers, canAccessAudits, logout, role } = useAuth();
  const { addToCart, totalItems } = useCart();

  const isAdmin = role === "admin";
  const isClient = role === "client" || (!isAdmin && role !== "auditor");

  useEffect(() => {
    fetch("https://fakestoreapi.com/products/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error al cargar categorías:", error));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory
      ? `https://fakestoreapi.com/products/category/${selectedCategory}`
      : "https://fakestoreapi.com/products";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
        setLoading(false);
      });
  }, [selectedCategory]);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ],
    );
  };

  const confirmDelete = (product: Product) => {
    Alert.alert(
      "¿Eliminar producto?",
      `¿Estás seguro de que deseas eliminar permanentemente "${product.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`https://fakestoreapi.com/products/${product.id}`, {
                method: "DELETE",
              });
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
              const msg = "Producto eliminado correctamente (Simulación)";
              if (Platform.OS === "android") {
                ToastAndroid.show(msg, ToastAndroid.SHORT);
              } else {
                Alert.alert("Éxito", msg);
              }
            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar el producto.");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>FakeStore App</Text>
          <Text style={styles.subtitle}>
            Catálogo · Rol: {role ? role.toUpperCase() : "CLIENTE"}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {isClient && (
            <TouchableOpacity
              accessibilityLabel="Ver carrito"
              style={styles.headerButton}
              onPress={() => router.push("/cart" as any)}
            >
              <Ionicons name="cart-outline" size={22} color="#10b981" />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {totalItems > 99 ? "99+" : totalItems}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {canAccessUsers && (
            <TouchableOpacity
              accessibilityLabel="Abrir directorio de usuarios"
              style={styles.headerButton}
              onPress={() => router.push("/users" as any)}
            >
              <Ionicons name="people-outline" size={22} color="#4f46e5" />
            </TouchableOpacity>
          )}

          {canAccessAudits && (
            <TouchableOpacity
              accessibilityLabel="Abrir auditoría de carritos"
              style={styles.headerButton}
              onPress={() => router.push("/audits" as any)}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#f59e0b"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            accessibilityLabel="Cerrar sesión"
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#e11d48" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chips */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              selectedCategory === null && styles.chipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === null && styles.chipTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                selectedCategory === cat && styles.chipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat && styles.chipTextActive,
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/product-detail" as any,
                  params: { id: item.id },
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>

                {/* Vista para Cliente: Botón Agregar */}
                {isClient && (
                  <TouchableOpacity
                    style={styles.btnQuickAdd}
                    onPress={async () => {
                      await addToCart(item as any, 1);
                      Alert.alert(
                        "Éxito",
                        `"${item.title.substring(0, 20)}..." añadido al carrito`,
                      );
                    }}
                  >
                    <Ionicons name="cart" size={14} color="#ffffff" />
                    <Text style={styles.btnQuickAddText}>Agregar</Text>
                  </TouchableOpacity>
                )}

                {/* Vista para Admin: Botones específicos de Editar y Eliminar para este ID */}
                {isAdmin && (
                  <View style={styles.adminCardActions}>
                    <TouchableOpacity
                      style={styles.btnCardEdit}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        router.push({
                          pathname: "/edit-product" as any,
                          params: { id: item.id },
                        });
                      }}
                    >
                      <Ionicons name="pencil" size={12} color="#4f46e5" />
                      <Text style={styles.btnCardEditText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnCardDelete}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        confirmDelete(item);
                      }}
                    >
                      <Ionicons name="trash" size={12} color="#e11d48" />
                      <Text style={styles.btnCardDeleteText}>Borrar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB de Añadir Producto (Solo Administrador) */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fabAdd}
          onPress={() => router.push("/create-product" as any)}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#64748b" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 24,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerCopy: { flex: 1 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  headerButton: {
    width: 40,
    height: 40,
    marginLeft: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#10b981",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: "#ffffff", fontSize: 10, fontWeight: "bold" },
  logoutButton: {
    width: 40,
    height: 40,
    marginLeft: 6,
    borderRadius: 20,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#64748b" },
  categoriesContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  chipScroll: { paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
    height: 36,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: "#4f46e5" },
  chipText: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  chipTextActive: { color: "#ffffff" },
  listContainer: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: { width: 68, height: 68, resizeMode: "contain", marginRight: 12 },
  info: { flex: 1 },
  productTitle: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  price: { fontSize: 15, color: "#16a34a", marginTop: 4, fontWeight: "bold" },
  btnQuickAdd: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    gap: 4,
  },
  btnQuickAddText: { color: "#ffffff", fontSize: 11, fontWeight: "700" },
  adminCardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  btnCardEdit: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  btnCardEditText: { fontSize: 11, fontWeight: "700", color: "#4f46e5" },
  btnCardDelete: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  btnCardDeleteText: { fontSize: 11, fontWeight: "700", color: "#e11d48" },
  fabAdd: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});
