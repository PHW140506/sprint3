import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Cart } from "@/types/cart";

interface CartAuditCardProps {
  cart: Cart;
}

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

export default function CartAuditCard({ cart }: CartAuditCardProps) {
  const [expanded, setExpanded] = useState(false);

  const totalItems = useMemo(
    () => cart.products.reduce((total, product) => total + product.quantity, 0),
    [cart.products],
  );

  return (
    <View style={styles.card}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Carrito ${cart.id}, usuario ${cart.userId}`}
        accessibilityHint="Muestra u oculta los artículos del carrito"
        activeOpacity={0.8}
        style={styles.summary}
        onPress={() => setExpanded((current) => !current)}
      >
        <View style={styles.iconBox}>
          <Ionicons name="cart-outline" size={23} color="#4f46e5" />
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.cartTitle}>Carrito #{cart.id}</Text>
          <Text style={styles.meta}>Usuario #{cart.userId}</Text>
          <Text style={styles.meta}>{formatDate(cart.date)}</Text>
        </View>

        <View style={styles.rightSummary}>
          <Text style={styles.itemCount}>{totalItems} uds.</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748b"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.detailArea}>
          <Text style={styles.detailHeading}>Artículos registrados</Text>

          {cart.products.length === 0 ? (
            <Text style={styles.emptyText}>Este carrito no contiene artículos.</Text>
          ) : (
            cart.products.map((product, index) => (
              <View
                key={`${cart.id}-${product.productId}-${index}`}
                style={styles.productRow}
              >
                <View style={styles.productCopy}>
                  <Text style={styles.productId}>
                    Producto #{product.productId}
                  </Text>
                  {!!product.title && (
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                  )}
                </View>

                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>x{product.quantity}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  cartTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 3,
  },
  rightSummary: {
    alignItems: "flex-end",
    gap: 5,
    marginLeft: 10,
  },
  itemCount: {
    color: "#4f46e5",
    fontSize: 12,
    fontWeight: "700",
  },
  detailArea: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  detailHeading: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cbd5e1",
  },
  productCopy: {
    flex: 1,
    paddingRight: 10,
  },
  productId: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "600",
  },
  productTitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  quantityBadge: {
    minWidth: 44,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
  },
  quantityText: {
    color: "#4338ca",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
  },
});
