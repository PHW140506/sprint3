import { User } from "../types/user";

export class UserServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserServiceError";
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch("https://fakestoreapi.com/users");

    if (!response.ok) {
      throw new UserServiceError(`Error del servidor (${response.status})`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new UserServiceError(
        "La respuesta del servidor no contiene una lista de usuarios válida.",
      );
    }

    return data.map((u: any) => ({
      id: u.id,
      email: u.email || "",
      username: u.username || "",
      password: u.password || "",
      name: {
        firstname: u.name?.firstname || "Usuario",
        lastname: u.name?.lastname || "",
      },
      address: {
        city: u.address?.city || "Sin ciudad",
        street: u.address?.street || "Sin calle",
        number: u.address?.number || 0,
        zipcode: u.address?.zipcode || "00000",
        geolocation: {
          lat: u.address?.geolocation?.lat || "0",
          long: u.address?.geolocation?.long || "0",
        },
      },
      phone: u.phone || "Sin teléfono",
    }));
  } catch (error: any) {
    if (error instanceof UserServiceError) {
      throw error;
    }
    throw new UserServiceError(
      "No se pudo conectar con el servicio de usuarios. Revisa tu conexión.",
    );
  }
}
