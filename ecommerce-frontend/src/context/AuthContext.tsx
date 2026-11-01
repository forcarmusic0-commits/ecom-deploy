import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { setAccessToken } from "@/api/axios";
import { loginApi, registerApi, logoutApi, refreshApi, getMeApi } from "@/api/auth.api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean; // true during the initial silent-refresh check on app load
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserFromToken: (token: string) => Promise<void>; // used by the OAuth redirect page
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load there's no access token in memory (page was refreshed), but the
  // httpOnly refresh cookie might still be valid - try to silently restore the session.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await refreshApi();
        setAccessToken(data.data.accessToken);
        const me = await getMeApi();
        setUser(me.data.data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await loginApi(email, password);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await registerApi(name, email, password);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  // Called from the /oauth-success page after Google redirects back with ?accessToken=
  const setUserFromToken = async (token: string) => {
    setAccessToken(token);
    const me = await getMeApi();
    setUser(me.data.data.user);
  };

  const refreshUser = async () => {
    const me = await getMeApi();
    setUser(me.data.data.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, setUserFromToken, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
