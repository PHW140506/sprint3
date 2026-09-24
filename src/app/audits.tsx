import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CartAuditCard from "@/components/CartAuditCard";
import { useAuth } from "@/context/AuthContext";
import { getGlobalCarts } from "@/services/cartService";
import type { Cart } from "@/types/cart";

export default function AuditsScreen() {
  const router = useRouter();
  const { canAccessAudits, role } = useAuth();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCarts = useCallback(async (fromRefresh = false) => {
    if (fromRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await getGlobalCarts();
      setCarts(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar el histórico de carritos.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!canAccessAudits) {
      router.replace("/");
      return;
    }

    void loadCarts();
  }, [canAccessAudits, loadCarts, router]);

  if (!canAccessAudits) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.stateText}>Redirigiendo a una sección permitida...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Regresar al catálogo"
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.headerCopy}>
          <Text style={styles.title}>Auditoría de carritos</Text>
          <Text style={styles.subtitle}>
            Histórico global · {role === "admin" ? "Administrador" : "Auditor"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.stateText}>Cargando histórico global...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons name="cloud-offline-outline" size={34} color="#e11d48" />
          </View>
          <Text style={styles.errorTitle}>No se pudo cargar la información</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadCarts()}>
            <Ionicons name="refresh" size={18} color="#ffffff" />
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={carts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadCarts(true)}
              tintColor="#4f46e5"
            />
          }
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryNumber}>{carts.length}</Text>
                <Text style={styles.summaryLabel}>carritos registrados</Text>
              </View>
              <Ionicons name="shield-checkmark-outline" size={32} color="#4f46e5" />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={38} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No hay carritos registrados</Text>
              <Text style={styles.emptyText}>
                La API respondió correctamente, pero no devolvió operaciones.
              </Text>
            </View>
          }
          renderItem={({ item }) => <CartAuditCard cart={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    marginRight: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: "#0f172a",
    fontSize: 21,
    fontWeight: "700",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  summaryNumber: {
    color: "#312e81",
    fontSize: 28,
    fontWeight: "800",
  },
  summaryLabel: {
    color: "#6366f1",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  stateText: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2",
    marginBottom: 14,
  },
  errorTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  errorText: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: "#4f46e5",
  },
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
});
