'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';

const links = [
  { href: "/admin/dashboard", label: "Beranda" },
  { href: "/admin/users", label: "Pengguna" },
  { href: "/admin/stores", label: "Toko" },
  { href: "/admin/products", label: "Produk" },
  { href: "/admin/orders", label: "Pesanan" },
  { href: "/admin/discounts", label: "Diskon" },
  { href: "/admin/deliveries", label: "Pengiriman" },
  { href: "/admin/late-orders", label: "Pesanan Terlambat" },
];

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await api.get('/admin/deliveries');
        setDeliveries(res.data);
      } catch (err) {
        toast.error('Gagal memuat pengiriman');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MENCARI_DRIVER': return <Badge variant="secondary">Mencari Driver</Badge>;
      case 'DRIVER_MENUJU_TOKO': return <Badge variant="default" className="bg-blue-500">Menuju Toko</Badge>;
      case 'SEDANG_DIKIRIM': return <Badge variant="default" className="bg-amber-500">Sedang Dikirim</Badge>;
      case 'SELESAI': return <Badge variant="default" className="bg-green-500">Selesai</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="ADMIN" links={links}>
      <h1 className="text-2xl font-bold mb-6">Monitoring Pengiriman (Delivery Jobs)</h1>

      {isLoading ? (
        <div>Memuat data pengiriman...</div>
      ) : (
        <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">ID Job</th>
                <th className="px-4 py-3 font-medium">Pesanan</th>
                <th className="px-4 py-3 font-medium">Toko</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Status Job</th>
                <th className="px-4 py-3 font-medium">Status Pesanan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deliveries.map(job => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{job.id.substring(0,8).toUpperCase()}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{job.order.id.substring(0,8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{job.order.store.name}</div>
                    <div className="text-xs text-muted-foreground">{job.order.deliveryAddress.city}</div>
                  </td>
                  <td className="px-4 py-3">
                    {job.driver ? (
                      <div>
                        <div className="font-medium">{job.driver.username}</div>
                        <div className="text-xs text-muted-foreground">{job.driver.email}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Belum ada driver</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{job.order.status}</span>
                  </td>
                </tr>
              ))}
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Belum ada job pengiriman dalam sistem.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
