"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken, getUser, clearAuth, AuthUser } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    try {
      if (getToken()) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error(error);
    } finally {
      clearAuth();
      window.location.href = "/";
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "BUYER": return "bg-blue-500 text-white";
      case "SELLER": return "bg-green-500 text-white";
      case "DRIVER": return "bg-orange-500 text-white";
      case "ADMIN": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/#reviews", label: "Reviews" },
  ];

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
          SEAPEDIA
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Link href="/auth/login"><Button variant="ghost">Login</Button></Link>
              <Link href="/auth/register"><Button>Register</Button></Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{user.username}</span>
                {user.activeRole && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.activeRole)}`}>
                    {user.activeRole}
                  </span>
                )}
              </div>
              {user.activeRole && (
                <Link href={`/${user.activeRole.toLowerCase()}/dashboard`}>
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger className="hover:bg-accent hover:text-accent-foreground rounded-md p-2">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4">
              <Link href="/" className="text-xl font-bold mt-4">SEAPEDIA</Link>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-lg font-medium">
                  {link.label}
                </Link>
              ))}
              <hr />
              {!user ? (
                <div className="flex flex-col gap-2 mt-4">
                  <Link href="/auth/login"><Button className="w-full" variant="outline">Login</Button></Link>
                  <Link href="/auth/register"><Button className="w-full">Register</Button></Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.username}</span>
                    {user.activeRole && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.activeRole)}`}>
                        {user.activeRole}
                      </span>
                    )}
                  </div>
                  {user.activeRole && (
                    <Link href={`/${user.activeRole.toLowerCase()}/dashboard`}>
                      <Button className="w-full" variant="outline">Dashboard</Button>
                    </Link>
                  )}
                  <Button className="w-full" variant="destructive" onClick={handleLogout}>Logout</Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
