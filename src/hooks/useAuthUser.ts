"use client";
import { useEffect, useState } from "react";

export type AppUser = "me" | "gf" | null;

export function useAuthUser() {
  const [user, setUser] = useState<AppUser>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);
  return user;
}
