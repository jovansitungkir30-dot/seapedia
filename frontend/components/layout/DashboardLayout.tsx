"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  links: { href: string; label: string }[];
}

export default function DashboardLayout({ children, role, links }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <ProtectedRoute role={role}>
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 bg-white p-6 rounded-lg shadow-sm border">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
