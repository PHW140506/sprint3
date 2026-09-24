import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Storage from '../services/secureStorage';
import { User } from '../types/user';
import { loginRequest } from '../services/auth';

const TOKEN_KEY = 'sprint3_auth_token';
const USER_KEY = 'sprint3_auth_user';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await Storage.getItem(TOKEN_KEY);
        const storedUser = await Storage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(username: string, password: string) {
    const { token: newToken, user: newUser } = await loginRequest(username, password);

    await Storage.setItem(TOKEN_KEY, newToken);
    await Storage.setItem(USER_KEY, JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    await Storage.deleteItem(TOKEN_KEY);
    await Storage.deleteItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
