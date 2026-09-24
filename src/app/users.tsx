import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { UserCard } from "@/components/UserCard";
import { useAuth } from "@/context/AuthContext";
import { getUsers, UserServiceError } from "@/services/userService";
import { User } from "@/types/user";

export default function UsersScreen() {
  const router = useRouter();
  const { canAccessUsers, role } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (showAlert = true) => {
    setError(null);

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (caughtError) {
      const message =
        caughtError instanceof UserServiceError
          ? caughtError.message
          : "No fue posible cargar los usuarios.";

      setError(message);

      if (showAlert) {
        Alert.alert("No se pudieron cargar los usuarios", message, [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reintentar",
            onPress: () => {
              void loadUsers(false);
            },
          },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (canAccessUsers) {
      void loadUsers();
    }
  }, [canAccessUsers, loadUsers]);

  if (!canAccessUsers) {
    return <Redirect href="/" />;
  }

  const onRefresh = () => {
    setRefreshing(true);
    void loadUsers(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Regresar al catálogo"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Directorio de usuarios</Text>
            <Text style={styles.subtitle}>
              {role === "admin" ? "Administrador" : "Auditor"} · Solo lectura
            </Text>
          </View>
        </View>

        {loading && users.length === 0 ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.stateTitle}>Cargando usuarios...</Text>
            <Text style={styles.stateDescription}>
              Consultando la información de Fake Store API.
            </Text>
          </View>
        ) : error && users.length === 0 ? (
          <View style={styles.centerState}>
            <View style={styles.errorIcon}>
              <Ionicons name="cloud-offline-outline" size={30} color="#e11d48" />
            </View>
            <Text style={styles.stateTitle}>No pudimos cargar el directorio</Text>
            <Text style={styles.stateDescription}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setLoading(true);
                void loadUsers(false);
              }}
              style={styles.retryButton}
            >
              <Ionicons name="refresh" size={18} color="#ffffff" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <UserCard user={item} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4f46e5"
              />
            }
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Ionicons name="people" size={22} color="#4f46e5" />
                </View>
                <View>
                  <Text style={styles.summaryValue}>{users.length}</Text>
                  <Text style={styles.summaryLabel}>cuentas registradas</Text>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={34} color="#94a3b8" />
                <Text style={styles.stateTitle}>No hay usuarios disponibles</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748b",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#312e81",
  },
  summaryLabel: {
    marginTop: 1,
    fontSize: 13,
    color: "#6366f1",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: "#fff1f2",
  },
  stateTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    color: "#0f172a",
  },
  stateDescription: {
    maxWidth: 340,
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "#64748b",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#4f46e5",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
});
