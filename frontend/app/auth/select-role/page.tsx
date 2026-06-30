"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getUser, setAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SelectRole() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.roles.length <= 1) {
      router.push("/");
    } else {
      setUser(u);
    }
  }, [router]);

  const selectRole = async (role: string) => {
    try {
      const res = await api.post("/auth/select-role", { role });
      setAuth(res.data.token, { ...user, activeRole: res.data.activeRole });
      window.location.href = `/${role.toLowerCase()}/dashboard`;
    } catch (error) {
      toast.error("Gagal memilih peran");
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Halo, {user.username}!</CardTitle>
          <CardDescription>Anda memiliki beberapa peran. Pilih peran yang ingin Anda gunakan saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {user.roles.map((role: string) => (
              <Button key={role} variant="outline" size="lg" className="h-24 text-xl" onClick={() => selectRole(role)}>
                Lanjutkan sebagai {role}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
