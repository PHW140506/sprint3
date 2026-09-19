import axios from "axios";

const BASE_URL = "https://fakestoreapi.com";

export interface ProductDTO {
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export interface ProductResponse extends ProductDTO {
  id: number;
}

export const createProduct = async (
  productData: ProductDTO,
): Promise<ProductResponse> => {
  const response = await axios.post<ProductResponse>(
    `${BASE_URL}/products`,
    productData,
  );
  return response.data;
};

// US07: Obtener datos actuales para pre-cargar el formulario (Escenario 2)
export const getProductById = async (id: number): Promise<ProductResponse> => {
  const response = await axios.get<ProductResponse>(
    `${BASE_URL}/products/${id}`,
  );
  return response.data;
};

// US07: Actualizar producto mediante PUT (Escenario 1)
export const updateProduct = async (
  id: number,
  productData: ProductDTO,
): Promise<ProductResponse> => {
  const response = await axios.put<ProductResponse>(
    `${BASE_URL}/products/${id}`,
    productData,
  );
  return response.data;
};

// US08: Eliminar producto consumiendo DELETE /products/{id}
export const deleteProduct = async (id: number): Promise<ProductResponse> => {
  const response = await axios.delete<ProductResponse>(
    `${BASE_URL}/products/${id}`,
  );
  return response.data;
};
