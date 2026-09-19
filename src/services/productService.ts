import axios from "axios";

const BASE_URL = "https://fakestoreapi.com";

export interface NewProductDTO {
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export interface ProductResponse extends NewProductDTO {
  id: number;
}

export const createProduct = async (
  productData: NewProductDTO,
): Promise<ProductResponse> => {
  const response = await axios.post<ProductResponse>(
    `${BASE_URL}/products`,
    productData,
  );
  return response.data;
};
