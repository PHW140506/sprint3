import NetInfo from "@react-native-community/netinfo";
import axios, { AxiosError } from "axios";

import { mapUser, User } from "@/types/user";

const BASE_URL = "https://fakestoreapi.com";

export class UserServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserServiceError";
  }
}

const getFriendlyMessage = (error: unknown): string => {
  if (error instanceof UserServiceError) return error.message;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.code === "ERR_NETWORK" ||
      !axiosError.response
    ) {
      return "No se pudo conectar con Fake Store API. Revisa tu conexión e inténtalo nuevamente.";
    }

    if (axiosError.response.status >= 500) {
      return "Fake Store API no está disponible temporalmente. Inténtalo de nuevo en unos momentos.";
    }
  }

  return "No fue posible cargar el directorio de usuarios.";
};

export const getUsers = async (): Promise<User[]> => {
  const network = await NetInfo.fetch();

  if (network.isConnected === false || network.isInternetReachable === false) {
    throw new UserServiceError(
      "Sin conexión a Internet. Conéctate a una red y vuelve a intentarlo.",
    );
  }

  try {
    const response = await axios.get<unknown>(`${BASE_URL}/users`, {
      timeout: 10000,
    });

    if (!Array.isArray(response.data)) {
      throw new UserServiceError(
        "La respuesta del servidor no contiene una lista de usuarios válida.",
      );
    }

    return response.data.map(mapUser);
  } catch (error) {
    throw new UserServiceError(getFriendlyMessage(error));
  }
};
