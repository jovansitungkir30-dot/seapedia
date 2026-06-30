'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageOpen, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const STATUS_BADGE: Record<string, { label: string, color: string, icon: any }> = {
  SEDANG_DIKEMAS: { label: 'Sedang Dikemas', color: 'bg-amber-100 text-amber-800', icon: PackageOpen },
  MENUNGGU_PENGIRIM: { label: 'Menunggu Pengirim', color: 'bg-blue-100 text-blue-800', icon: Clock },
  SEDANG_DIKIRIM: { label: 'Sedang Dikirim', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  PESANAN_SELESAI: { label: 'Selesai', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  DIKEMBALIKAN: { label: 'Dikembalikan / Batal', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/buyer/orders');
        setOrders(res.data);
      } catch (err) {
        toast.error('Gagal mengambil daftar pesanan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) return <div>Memuat pesanan...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pesanan Saya</h1>

      {!orders.length ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <PackageOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="mb-2">Belum ada pesanan</CardTitle>
          <div className="text-muted-foreground mb-6">Mulai belanja sekarang!</div>
          <Link href="/products" className={buttonVariants()}>Katalog Produk</Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = STATUS_BADGE[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800', icon: PackageOpen };
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold">{order.store.name}</span>
                      <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <Badge variant="outline" className="font-mono text-xs">#{order.id.slice(-8)}</Badge>
                    </div>
                    <Badge className={`${statusInfo.color} border-none flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col md:flex-row gap-6 justify-between">
                  <div className="space-y-3 flex-1">
                    {order.items.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} barang x Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-xs text-muted-foreground italic">
                        + {order.items.length - 2} produk lainnya
                      </div>
                    )}
                  </div>
                  <div className="md:border-l md:pl-6 flex flex-col justify-center min-w-[200px]">
                    <div className="text-sm text-muted-foreground mb-1">Total Belanja</div>
                    <div className="font-bold text-lg text-primary">Rp {order.totalAmount.toLocaleString('id-ID')}</div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t pt-4">
                  <Link href={`/buyer/orders/${order.id}`} className={buttonVariants({ variant: 'outline' })}>
                    Lihat Detail Pesanan
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
