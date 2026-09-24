import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  const { canAccessAudits } = useAuth();

  // 1. Obtener las categorías disponibles al iniciar (Endpoint: /products/categories)
  useEffect(() => {
    fetch('https://fakestoreapi.com/products/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error('Error al cargar categorías:', error));
  }, []);

  // 2. Obtener productos (general o filtrados por categoría)
  useEffect(() => {
    setLoading(true);
    const url = selectedCategory 
      ? `https://fakestoreapi.com/products/category/${selectedCategory}`
      : 'https://fakestoreapi.com/products';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar productos:', error);
        setLoading(false);
      });
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>FakeStore App</Text>
          <Text style={styles.subtitle}>Catálogo de productos</Text>
        </View>

        {canAccessAudits && (
          <TouchableOpacity
            accessibilityLabel="Abrir auditoría de carritos"
            style={styles.auditButton}
            onPress={() => router.push("/audits" as any)}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color="#4f46e5" />
          </TouchableOpacity>
        )}
      </View>

      {/* Barra de categorías horizontal (Chips) */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          <TouchableOpacity 
            style={[styles.chip, selectedCategory === null && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, selectedCategory === null && styles.chipTextActive]}>Todos</Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de productos o indicador de carga */}
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
      )}

      {/* Botones flotantes del equipo */}
      <TouchableOpacity
        style={styles.fabDelete}
        onPress={() => router.push({ pathname: "/product-detail" as any, params: { id: 1 } })}
      >
        <Ionicons name="trash" size={20} color="#ffffff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fabEdit}
        onPress={() => router.push({ pathname: "/edit-product" as any, params: { id: 1 } })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerCopy: { flex: 1 },
  auditButton: {
    width: 44,
    height: 44,
    marginLeft: 12,
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  chipScroll: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#4f46e5',
  },
  chipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
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
