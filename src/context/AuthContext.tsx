import * as SecureStore from "expo-secure-store";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { loginUser, UserRole } from "../services/authService";

export type AppRole = UserRole;

interface AuthContextValue {
  userId: number | null;
  role: AppRole | null;
  token: string | null;
  username: string | null;
  isLoading: boolean;
  canAccessUsers: boolean;
  canAccessAudits: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar sesión persistida en el almacenamiento nativo
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("user_token");
        const storedRole = (await SecureStore.getItemAsync(
          "user_role",
        )) as AppRole | null;
        const storedUsername = await SecureStore.getItemAsync("user_username");
        const storedUserId = await SecureStore.getItemAsync("user_id");

        if (storedToken && storedRole) {
          setToken(storedToken);
          setRole(storedRole);
          setUsername(storedUsername);
          setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
        }
      } catch (error) {
        console.error("Error al cargar credenciales de SecureStore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  const login = async (u: string, p: string) => {
    const data = await loginUser(u, p);

    setToken(data.token);
    setRole(data.role);
    setUsername(data.username);
    setUserId(data.userId);

    // Persistencia segura en disco
    await SecureStore.setItemAsync("user_token", data.token);
    await SecureStore.setItemAsync("user_role", data.role);
    await SecureStore.setItemAsync("user_username", data.username);
    await SecureStore.setItemAsync("user_id", data.userId.toString());
  };

  const logout = async () => {
    setToken(null);
    setRole(null);
    setUsername(null);
    setUserId(null);

    await SecureStore.deleteItemAsync("user_token");
    await SecureStore.deleteItemAsync("user_role");
    await SecureStore.deleteItemAsync("user_username");
    await SecureStore.deleteItemAsync("user_id");
  };

  const canAccessUsers = role === "admin" || role === "auditor";
  const canAccessAudits = role === "admin" || role === "auditor";

  return (
    <AuthContext.Provider
      value={{
        userId,
        role,
        token,
        username,
        isLoading,
        canAccessUsers,
        canAccessAudits,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }
  return context;
}
