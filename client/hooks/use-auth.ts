"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/auth-service";
import type { User as AuthUser, Business } from "@shared/types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [business, setBusiness] = useState<Business | null>(authService.getBusinessData());

  useEffect(() => {
    const handleStorage = () => {
      setUser(authService.getCurrentUser());
      setBusiness(authService.getBusinessData());
    };

    // Sync across tabs and when auth-service updates localStorage
    window.addEventListener("storage", handleStorage);

    // Poll as a fallback to catch in-tab changes
    const interval = setInterval(handleStorage, 3000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const isAuthenticated = !!user;
  const hasPermission = (permission: string) => authService.hasPermission(permission);
  const isOwner = authService.isOwner();

  return { user, business, isAuthenticated, hasPermission, isOwner } as const;
}
