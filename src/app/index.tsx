import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar el catálogo:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FakeStore App</Text>
        <Text style={styles.subtitle}>Catálogo de productos</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/product-detail' as any, params: { id: item.id } })}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Botones flotantes del equipo */}
      <TouchableOpacity
        style={styles.fabDelete}
        onPress={() =>
          router.push({
            pathname: "/product-detail" as any,
            params: { id: 1 },
          })
        }
      >
        <Ionicons name="trash" size={20} color="#ffffff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fabEdit}
        onPress={() =>
          router.push({
            pathname: "/edit-product" as any,
            params: { id: 1 },
          })
        }
      >
        <Ionicons name="pencil" size={22} color="#ffffff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create-product" as any)}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  listContainer: { padding: 16, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: '#ffffff', marginBottom: 12, borderRadius: 12, padding: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  image: { width: 60, height: 60, resizeMode: 'contain', marginRight: 12 },
  info: { flex: 1 },
  productTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  price: { fontSize: 14, color: '#16a34a', marginTop: 6, fontWeight: 'bold' },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabEdit: {
    position: "absolute",
    bottom: 92,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabDelete: {
    position: "absolute",
    bottom: 160,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});