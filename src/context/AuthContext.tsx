import { createContext, PropsWithChildren, useContext, useMemo } from "react";

export type AppRole = "admin" | "auditor" | "client";

interface AuthContextValue {
  userId: number;
  role: AppRole;
  canAccessUsers: boolean;
  canAccessAudits: boolean;
}

const roleFromUserId = (userId: number): AppRole => {
  if (userId === 1 || userId === 2) return "admin";
  if (userId === 3) return "auditor";
  return "client";
};

const readInitialUserId = (): number => {
  const configuredId = Number(process.env.EXPO_PUBLIC_USER_ID ?? "1");
  return Number.isInteger(configuredId) && configuredId > 0 ? configuredId : 1;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const userId = readInitialUserId();

  const value = useMemo<AuthContextValue>(() => {
    const role = roleFromUserId(userId);

    return {
      userId,
      role,
      canAccessUsers: role === "admin" || role === "auditor",
      canAccessAudits: role === "admin" || role === "auditor",
    };
  }, [userId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
