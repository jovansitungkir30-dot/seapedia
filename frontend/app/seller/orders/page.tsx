'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const STATUS_BADGE: Record<string, { label: string, color: string }> = {
  SEDANG_DIKEMAS: { label: 'Pesanan Baru (Perlu Diproses)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  MENUNGGU_PENGIRIM: { label: 'Menunggu Pick-up', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  SEDANG_DIKIRIM: { label: 'Sedang Dikirim', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  PESANAN_SELESAI: { label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-300' },
  DIKEMBALIKAN: { label: 'Batal / Dikembalikan', color: 'bg-red-100 text-red-800 border-red-300' },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/seller/orders');
        setOrders(res.data);
      } catch (err) {
        toast.error('Gagal mengambil daftar pesanan masuk');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) return <div>Memuat pesanan masuk...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pesanan Masuk</h1>

      {!orders.length ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="mb-2">Belum ada pesanan masuk</CardTitle>
          <div className="text-muted-foreground">Tunggu pembeli memesan produk Anda!</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = STATUS_BADGE[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/20 pb-3 border-b">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-primary">{order.buyer.username}</span>
                      <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <Badge variant="outline" className="font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</Badge>
                    </div>
                    <Badge className={`${statusInfo.color} font-medium px-3 py-1`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col md:flex-row gap-6 justify-between items-center">
                  <div className="space-y-3 flex-1 w-full">
                    <div className="text-sm font-semibold mb-2">Produk Dipesan:</div>
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="font-medium text-right">
                          Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="md:border-l md:pl-6 flex flex-col justify-center min-w-[250px] w-full text-right md:text-left">
                    <div className="text-sm text-muted-foreground mb-1">Pendapatan Kotor</div>
                    <div className="font-bold text-xl text-primary mb-2">Rp {(order.totalAmount - order.deliveryFee).toLocaleString('id-ID')}</div>
                    <div className="text-xs text-muted-foreground mb-4">Pengiriman: {order.deliveryMethod}</div>
                    
                    <Link href={`/seller/orders/${order.id}`} className={buttonVariants({ variant: order.status === 'SEDANG_DIKEMAS' ? 'default' : 'outline', className: 'w-full' })}>
                      {order.status === 'SEDANG_DIKEMAS' ? 'Proses Pesanan' : 'Lihat Detail'}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
