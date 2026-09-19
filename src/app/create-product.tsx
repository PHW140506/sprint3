import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { createProduct } from "../services/productService";

// Simulación del rol activo (Para probar: 'admin', 'client' o 'auditor')
const CURRENT_USER_ROLE: "admin" | "client" | "auditor" = "admin";

const CATEGORIES = [
  "men's clothing",
  "women's clothing",
  "jewelery",
  "electronics",
];

export default function CreateProductScreen() {
  const router = useRouter();

  // Escenario 3: Bloqueo de acceso si no es Administrador
  if (CURRENT_USER_ROLE !== "admin") {
    Alert.alert(
      "Acceso Denegado",
      "Solo administradores pueden crear productos.",
      [{ text: "Aceptar", onPress: () => router.replace("/") }],
    );
    return null;
  }

  // Estado del formulario
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [image, setImage] = useState(
    "https://placehold.co/400x400/4f46e5/ffffff?text=Nuevo+Articulo",
  );
  const [description, setDescription] = useState("");

  // Estado de validación y carga
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

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

  const handleSave = async () => {
    // Escenario 2: Validación antes de mandar la petición
    if (!validate()) {
      Alert.alert(
        "Campos inválidos",
        "Por favor corrige los campos marcados en rojo. El precio debe ser numérico mayor a 0 y la URL debe ser válida.",
      );
      return;
    }

    setLoading(true);

    try {
      // Escenario 1: Petición POST a la API
      const response = await createProduct({
        title: title.trim(),
        price: parseFloat(price),
        category,
        image: image.trim(),
        description: description.trim(),
      });

      // Confirmación con el nuevo ID generado
      Alert.alert(
        "Producto Creado",
        `El artículo fue registrado con éxito en la API con el ID: #${response.id} (Simulación).`,
        [
          {
            text: "Aceptar",
            onPress: () => {
              // Limpiar formulario
              setTitle("");
              setPrice("");
              setImage(
                "https://placehold.co/400x400/4f46e5/ffffff?text=Nuevo+Articulo",
              );
              setDescription("");
              setErrors({});
              router.back();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo conectar con el servidor de Fake Store API.",
      );
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Nuevo Producto (POST)</Text>
      </View>

      {/* Tarjeta con el formulario */}
      <View style={styles.card}>
        {/* Título */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Título del Producto *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Ej: Smartwatch Pro"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors({ ...errors, title: false });
            }}
          />
        </View>

        {/* Fila: Precio y Categoría */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Precio ($ USD) *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder="29.99"
              placeholderTextColor="#94a3b8"
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

        {/* URL de Imagen */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>URL de Imagen *</Text>
          <TextInput
            style={[styles.input, errors.image && styles.inputError]}
            placeholder="https://..."
            placeholderTextColor="#94a3b8"
            value={image}
            onChangeText={(img) => {
              setImage(img);
              if (errors.image) setErrors({ ...errors, image: false });
            }}
          />
        </View>

        {/* Descripción */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            placeholder="Descripción detallada del artículo..."
            placeholderTextColor="#94a3b8"
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

        {/* Botones de acción */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.btnCancel}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSubmit, loading && styles.btnSubmitDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.btnSubmitText}>Guardar Producto</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
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
  inputError: {
    borderColor: "#e11d48",
    backgroundColor: "#fff1f2",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginBottom: 4,
  },
  categoryChipActive: {
    backgroundColor: "#4f46e5",
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  btnCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  btnSubmit: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSubmitDisabled: {
    opacity: 0.7,
  },
  btnSubmitText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
