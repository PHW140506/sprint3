import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getFullName, User } from "@/types/user";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const [expanded, setExpanded] = useState(false);
  const address = [
    user.address.street,
    user.address.number !== null ? String(user.address.number) : "",
    user.address.city,
    user.address.zipcode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver información de ${getFullName(user)}`}
      onPress={() => setExpanded((current) => !current)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={22} color="#4f46e5" />
      </View>

      <View style={styles.content}>
        <View style={styles.headingRow}>
          <View style={styles.headingText}>
            <Text style={styles.name}>{getFullName(user)}</Text>
            <Text style={styles.username}>@{user.username || "sin_usuario"}</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748b"
          />
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#64748b" />
          <Text style={styles.detailText} numberOfLines={1}>
            {user.email || "Correo no disponible"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#64748b" />
          <Text style={styles.detailText}>
            {user.phone || "Teléfono no disponible"}
          </Text>
        </View>

        {expanded && (
          <View style={styles.expandedArea}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#64748b" />
              <Text style={styles.detailText}>
                {address || "Dirección no disponible"}
              </Text>
            </View>
            <Text style={styles.readOnlyLabel}>Información de solo lectura</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.82,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
  },
  content: {
    flex: 1,
    gap: 8,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  headingText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  username: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#4f46e5",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },
  expandedArea: {
    gap: 8,
    paddingTop: 10,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  readOnlyLabel: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    backgroundColor: "#f1f5f9",
  },
});
