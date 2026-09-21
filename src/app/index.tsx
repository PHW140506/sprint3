import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductDetail {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Simulación de sesión local para cumplir con la regla de negocio (ej. "admin" o "cliente")
  const [userRole, setUserRole] = useState<string>("admin"); 

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Producto no disponible");
        }
        return res.json();
      })
      .then((data) => {
        if (!data) {
          throw new Error("Producto no disponible");
        }
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        Alert.alert("Error", "Producto no disponible", [
          { text: "OK", onPress: () => router.back() }
        ]);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando detalle...</Text>
      </View>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.category}>{product.category.toUpperCase()}</Text>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        
        <Text style={styles.sectionTitle} suppressHighlighting={true}>Descripción</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Interfaz dinámica condicionada estrictamente por el rol de sesión local (US05) */}
        {userRole === "admin" && (
          <View style={styles.adminActions}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => router.push({ pathname: "/edit-product" as any, params: { id: product.id } })}
            >
              <Ionicons name="pencil" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => {
                Alert.alert("Eliminar", "¿Estás segura de eliminar este producto?", [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Eliminar", style: "destructive", onPress: () => router.back() }
                ]);
              }}
            >
              <Ionicons name="trash" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
    flexGrow: 1,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: "#ffffff" 
  },
  loadingText: { 
    marginTop: 10, 
    color: '#64748b' 
  },
  image: { 
    width: '100%', 
    height: 280, 
    resizeMode: 'contain', 
    marginBottom: 20 
  },
  content: {
    flex: 1,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: 6,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 24,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingVertical: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#e11d48',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});