import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getProductById, updateProduct } from "../services/productService";

// Rol activo de prueba para US07
const CURRENT_USER_ROLE: "admin" | "client" | "auditor" = "admin";

const CATEGORIES = [
  "men's clothing",
  "women's clothing",
  "jewelery",
  "electronics",
];

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : 1;

  if (CURRENT_USER_ROLE !== "admin") {
    Alert.alert(
      "Acceso Denegado",
      "No tienes permisos para editar artículos.",
      [{ text: "Aceptar", onPress: () => router.replace("/") }],
    );
    return null;
  }

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentData = async () => {
      try {
        const data = await getProductById(productId);
        if (isMounted) {
          setTitle(data.title);
          setPrice(data.price.toString());
          setCategory(data.category);
          setImage(data.image);
          setDescription(data.description);
        }
      } catch (err) {
        Alert.alert(
          "Error",
          "No se pudieron recuperar los datos del producto.",
        );
      } finally {
        if (isMounted) setLoadingFetch(false);
      }
    };

    fetchCurrentData();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const validate = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!title.trim()) newErrors.title = true;
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)
      newErrors.price = true;
    if (!image.trim() || !image.startsWith("http")) newErrors.image = true;
    if (!description.trim()) newErrors.description = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) {
      Alert.alert(
        "Campos inválidos",
        "El precio debe ser numérico y ningún campo de texto debe quedar vacío.",
      );
      return;
    }

    setLoadingSave(true);

    try {
      await updateProduct(productId, {
        title: title.trim(),
        price: parseFloat(price),
        category,
        image: image.trim(),
        description: description.trim(),
      });

      Alert.alert("Operación Exitosa", "Producto actualizado (Simulación)", [
        { text: "Aceptar", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Falló la conexión al actualizar el producto.");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingFetch) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando datos del artículo...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Editar Producto ID #{productId} (PUT)
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Título del Producto *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors({ ...errors, title: false });
            }}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Precio ($ USD) *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              keyboardType="numeric"
              value={price}
              onChangeText={(p) => {
                setPrice(p);
                if (errors.price) setErrors({ ...errors, price: false });
              }}
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1.2 }]}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>URL de Imagen *</Text>
          <TextInput
            style={[styles.input, errors.image && styles.inputError]}
            value={image}
            onChangeText={(img) => {
              setImage(img);
              if (errors.image) setErrors({ ...errors, image: false });
            }}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={(d) => {
              setDescription(d);
              if (errors.description)
                setErrors({ ...errors, description: false });
            }}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.btnCancel}
            onPress={() => router.back()}
            disabled={loadingSave}
          >
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSubmit, loadingSave && styles.btnSubmitDisabled]}
            onPress={handleUpdate}
            disabled={loadingSave}
          >
            {loadingSave ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.btnSubmitText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  contentContainer: { padding: 16, paddingTop: 48 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
  },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", color: "#334155", marginBottom: 6 },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
  },
  inputError: { borderColor: "#e11d48", backgroundColor: "#fff1f2" },
  textArea: { height: 90, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  categoriesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginBottom: 4,
  },
  categoryChipActive: { backgroundColor: "#4f46e5" },
  categoryChipText: { fontSize: 10, fontWeight: "600", color: "#475569" },
  categoryChipTextActive: { color: "#ffffff" },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  btnCancelText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  btnSubmit: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSubmitDisabled: { opacity: 0.7 },
  btnSubmitText: { fontSize: 13, fontWeight: "bold", color: "#ffffff" },
});
