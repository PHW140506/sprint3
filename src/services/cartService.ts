import axios from "axios";

import type { Cart, CartApiResponse, ProductSummary } from "@/types/cart";

const BASE_URL = "https://fakestoreapi.com";

const toPositiveNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const normalizeCart = (
  rawCart: CartApiResponse,
  productTitles: Map<number, string>,
): Cart => {
  const products = Array.isArray(rawCart.products) ? rawCart.products : [];

  return {
    id: toPositiveNumber(rawCart.id),
    userId: toPositiveNumber(rawCart.userId),
    date: typeof rawCart.date === "string" ? rawCart.date : "",
    products: products.map((product) => {
      const productId = toPositiveNumber(product?.productId);
      return {
        productId,
        quantity: toPositiveNumber(product?.quantity),
        title: productTitles.get(productId),
      };
    }),
  };
};

const getProductTitles = async (): Promise<Map<number, string>> => {
  try {
    const response = await axios.get<ProductSummary[]>(`${BASE_URL}/products`);
    const products = Array.isArray(response.data) ? response.data : [];

    return new Map(
      products
        .filter(
          (product) =>
            Number.isFinite(Number(product?.id)) &&
            typeof product?.title === "string",
        )
        .map((product) => [Number(product.id), product.title]),
    );
  } catch {
    // El cruce con /products es complementario. Si falla, US12 sigue mostrando
    // productId y quantity, que son los datos obligatorios de la historia.
    return new Map<number, string>();
  }
};

export const getGlobalCarts = async (): Promise<Cart[]> => {
  try {
    const response = await axios.get<CartApiResponse[]>(`${BASE_URL}/carts`);

    if (!Array.isArray(response.data)) {
      throw new Error("La API no devolvió una lista válida de carritos.");
    }

    const productTitles = await getProductTitles();

    return response.data
      .map((cart) => normalizeCart(cart ?? {}, productTitles))
      .sort((a, b) => {
        const dateA = Date.parse(a.date);
        const dateB = Date.parse(b.date);

        if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
          return b.id - a.id;
        }

        return dateB - dateA;
      });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          "Sin conexión. Revisa tu acceso a internet e intenta nuevamente.",
        );
      }

      throw new Error(
        `No fue posible cargar el histórico de carritos (HTTP ${error.response.status}).`,
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Ocurrió un error inesperado al cargar los carritos.");
  }
};
