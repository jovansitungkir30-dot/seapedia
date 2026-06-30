"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

const registerSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(30),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
  roles: z.array(z.enum(["BUYER", "SELLER", "DRIVER"])).min(1, "Pilih minimal 1 peran"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { roles: [] }
  });

  const roles = watch("roles");

  const handleRoleToggle = (role: "BUYER" | "SELLER" | "DRIVER") => {
    if (roles.includes(role)) {
      setValue("roles", roles.filter(r => r !== role));
    } else {
      setValue("roles", [...roles, role]);
    }
  };

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setLoading(true);
      await api.post("/auth/register", values);
      toast.success("Registrasi berhasil, sedang login...");
      
      const loginRes = await api.post("/auth/login", { email: values.email, password: values.password });
      setAuth(loginRes.data.token, loginRes.data.user);
      
      if (loginRes.data.requiresRoleSelection) {
        router.push("/auth/select-role");
      } else {
        const role = loginRes.data.user.roles[0].toLowerCase();
        router.push(`/${role}/dashboard`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Daftar Akun Baru</CardTitle>
          <CardDescription>Bergabung dengan SEAPEDIA sekarang</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Username" {...register("username")} />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <Input placeholder="Email" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Input type="password" placeholder="Password" {...register("password")} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Input type="password" placeholder="Konfirmasi Password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Pilih Peran (Bisa lebih dari 1)</p>
              <div className="flex gap-2">
                {["BUYER", "SELLER", "DRIVER"].map(r => (
                  <Button 
                    key={r} type="button" 
                    variant={roles.includes(r as any) ? "default" : "outline"}
                    onClick={() => handleRoleToggle(r as any)}
                    className="flex-1"
                  >
                    {r}
                  </Button>
                ))}
              </div>
              {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Daftar"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Sudah punya akun? <Link href="/auth/login" className="text-primary font-semibold">Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
