"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
    setReady(true);
  }, []);

  return { user, setUser, ready };
}