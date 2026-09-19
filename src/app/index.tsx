import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FakeStore App</Text>
      <Text style={styles.subtitle}>Catálogo de productos</Text>
      {/* Botón flotante para probar US08: Ver detalle y eliminar producto ID 1 */}
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
      {/* Botón flotante para probar US07: Editar producto ID 1 */}
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

      {/* Botón flotante para abrir US06: Crear producto */}
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
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
