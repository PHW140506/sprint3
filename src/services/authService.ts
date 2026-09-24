import NetInfo from "@react-native-community/netinfo";

export type UserRole = "admin" | "auditor" | "client";

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: UserRole;
}

/**
 * Mapeo estricto de roles por ID de Fake Store API:
 * IDs 1 y 2 -> admin
 * ID 3 -> auditor
 * IDs > 3 -> client
 */
export function mapRoleById(userId: number): UserRole {
  if (userId === 1 || userId === 2) {
    return "admin";
  }
  if (userId === 3) {
    return "auditor";
  }
  return "client";
}

export async function loginUser(
  username: string,
  password: string,
): Promise<LoginResponse> {
  // Escenario 3: Verificación de red previa
  const netState = await NetInfo.fetch();
  const hasInternet = Boolean(
    netState.isConnected && netState.isInternetReachable !== false,
  );

  if (!hasInternet) {
    throw new Error("NO_INTERNET");
  }

  // Escenario 1 y 2: Consumo de la API para Login
  const loginRes = await fetch("https://fakestoreapi.com/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!loginRes.ok) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const loginData = await loginRes.json();
  const token = loginData.token;

  // Obtener ID real del usuario consultando el directorio
  let userId = 4;
  try {
    const usersRes = await fetch("https://fakestoreapi.com/users");
    if (usersRes.ok) {
      const users = await usersRes.json();
      const foundUser = users.find(
        (u: any) => u.username?.toLowerCase() === username.toLowerCase(),
      );
      if (foundUser?.id) {
        userId = foundUser.id;
      }
    }
  } catch (err) {
    console.warn(
      "No se pudo obtener el ID del usuario, usando ID por defecto",
      err,
    );
  }

  const role = mapRoleById(userId);

  return {
    token,
    userId,
    username,
    role,
  };
}
