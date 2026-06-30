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

export default function AdminLateOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders');
        // Filter only auto-cancelled orders (status DIKEMBALIKAN)
        setOrders(res.data.filter((o: any) => o.status === 'DIKEMBALIKAN'));
      } catch (err) {
        toast.error('Gagal memuat pesanan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <DashboardLayout role="ADMIN" links={links}>
      <h1 className="text-2xl font-bold mb-2">Pesanan Terlambat (Auto-Cancel)</h1>
      <p className="text-muted-foreground mb-6">Daftar pesanan yang dibatalkan otomatis oleh sistem karena penjual terlambat memproses.</p>

      {isLoading ? (
        <div>Memuat data pesanan...</div>
      ) : (
        <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">ID Pesanan</th>
                <th className="px-4 py-3 font-medium">Pembeli (Refund Ke)</th>
                <th className="px-4 py-3 font-medium">Penjual Terlambat</th>
                <th className="px-4 py-3 font-medium">Tanggal Dibatalkan</th>
                <th className="px-4 py-3 font-medium">Total Refund (Rp)</th>
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
                    <div className="font-medium text-destructive">{order.store.name}</div>
                    <div className="text-xs text-muted-foreground">{order.seller.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(order.updatedAt).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {order.totalAmount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Tidak ada pesanan terlambat yang dibatalkan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
