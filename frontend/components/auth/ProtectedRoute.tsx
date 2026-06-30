"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function ProtectedRoute({ children, role }: { children: React.ReactNode, role: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/auth/login");
    } else if (user.activeRole !== role) {
      router.push("/");
    } else {
      setAuthorized(true);
    }
    setLoading(false);
  }, [router, role]);

  if (loading || !authorized) return <div className="p-8 text-center">Loading...</div>;

  return <>{children}</>;
}
