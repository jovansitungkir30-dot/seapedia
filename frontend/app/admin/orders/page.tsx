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

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders');
        setOrders(res.data);
      } catch (err) {
        toast.error('Gagal memuat pesanan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SEDANG_DIKEMAS': return <Badge variant="secondary">Sedang Dikemas</Badge>;
      case 'MENUNGGU_PENGIRIM': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Menunggu Pengirim</Badge>;
      case 'MENCARI_DRIVER': return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Mencari Driver</Badge>;
      case 'DRIVER_MENUJU_TOKO': return <Badge variant="secondary" className="bg-blue-200 text-blue-900">Driver Menuju Toko</Badge>;
      case 'SEDANG_DIKIRIM': return <Badge variant="default" className="bg-amber-500">Sedang Dikirim</Badge>;
      case 'PESANAN_SELESAI': return <Badge variant="default" className="bg-green-500">Selesai</Badge>;
      case 'DIKEMBALIKAN': return <Badge variant="destructive">Dibatalkan</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="ADMIN" links={links}>
      <h1 className="text-2xl font-bold mb-6">Monitoring Seluruh Pesanan</h1>

      {isLoading ? (
        <div>Memuat data pesanan...</div>
      ) : (
        <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">ID Pesanan</th>
                <th className="px-4 py-3 font-medium">Pembeli</th>
                <th className="px-4 py-3 font-medium">Penjual/Toko</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Total (Rp)</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{order.id.substring(0,8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.buyer.username}</div>
                    <div className="text-xs text-muted-foreground">{order.buyer.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.store.name}</div>
                    <div className="text-xs text-muted-foreground">{order.seller.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {order.totalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Belum ada pesanan dalam sistem.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
