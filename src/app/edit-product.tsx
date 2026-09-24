import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = [
  "men's clothing",
  "women's clothing",
  "jewelery",
  "electronics",
];

export default function EditProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  // Respaldo seguro si id viene como array o string
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const productId = rawId ? parseInt(rawId, 10) : 1;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("electronics");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar datos del producto a editar
  useEffect(() => {
    let isMounted = true;

    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://fakestoreapi.com/products/${productId}`,
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener el producto");
        }
        const data = await response.json();

        if (isMounted && data && typeof data === "object") {
          setTitle(data.title || "");
          setPrice(data.price !== undefined ? String(data.price) : "");
          setCategory(data.category || "electronics");
          setImage(data.image || "");
          setDescription(data.description || "");
        }
      } catch (error) {
        console.error("Error al cargar producto:", error);
        if (isMounted) {
          Alert.alert(
            "Aviso",
            "No se pudieron recuperar los datos remotos. Puedes completar los campos manualmente para continuar.",
            [{ text: "OK" }],
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleUpdate = async () => {
    const numPrice = parseFloat(price);

    if (
      !title.trim() ||
      isNaN(numPrice) ||
      numPrice <= 0 ||
      !description.trim()
    ) {
      Alert.alert(
        "Campos inválidos",
        "Por favor completa el título, descripción y un precio válido mayor a 0.",
      );
      return;
    }

    setSaving(true);
    try {
      // Simulación PUT a Fake Store API (US07)
      await fetch(`https://fakestoreapi.com/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          price: numPrice,
          description: description.trim(),
          image: image.trim(),
          category,
        }),
      });

      Alert.alert("Operación Exitosa", "Producto actualizado (Simulación)", [
        { text: "Aceptar", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando datos del producto...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Editar Producto ID #{productId} (PUT)
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título del Producto *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Título"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio ($ USD) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              keyboardType="decimal-pad"
              onChangeText={setPrice}
              placeholder="0.00"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.categoryChips}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de Imagen *</Text>
            <TextInput
              style={styles.input}
              value={image}
              onChangeText={setImage}
              placeholder="https://..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Descripción del producto..."
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, saving && { opacity: 0.7 }]}
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    paddingTop: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: { marginTop: 10, color: "#64748b" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  categoryChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  chipActive: { backgroundColor: "#4f46e5" },
  chipText: { fontSize: 12, color: "#475569", fontWeight: "600" },
  chipTextActive: { color: "#ffffff" },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  cancelBtnText: { color: "#475569", fontWeight: "bold", fontSize: 14 },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#4f46e5",
    alignItems: "center",
  },
  submitBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
});
