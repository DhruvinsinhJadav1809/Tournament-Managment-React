import { useState, useCallback } from "react";
import { authStore } from "@/store/authStore";
import type { AuthUser } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { stopConnection } from "@/lib/signalr";

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(() => authStore.get());

  const login = useCallback((userData: AuthUser) => {
    authStore.set(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await stopConnection();
    authStore.clear();
    queryClient.clear();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "Admin",
    login,
    logout,
  };
}
