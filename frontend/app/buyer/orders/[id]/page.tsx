'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Store, Receipt, Clock, PackageOpen, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const STATUS_STEPS = [
  { id: 'SEDANG_DIKEMAS', label: 'Sedang Dikemas', icon: PackageOpen },
  { id: 'MENUNGGU_PENGIRIM', label: 'Menunggu Pengirim', icon: Clock },
  { id: 'SEDANG_DIKIRIM', label: 'Sedang Dikirim', icon: Truck },
  { id: 'PESANAN_SELESAI', label: 'Selesai', icon: CheckCircle2 },
];

export default function BuyerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/buyer/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        toast.error('Gagal mengambil detail pesanan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) return <div>Memuat detail pesanan...</div>;
  if (!order) return <div>Pesanan tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Detail Pesanan
        </h1>
        <Badge variant="outline" className="font-mono bg-background text-sm px-3 py-1">#{order.id.toUpperCase()}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {order.status === 'DIKEMBALIKAN' ? (
              <div className="text-center p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <h3 className="font-bold text-lg mb-2">Pesanan Dikembalikan / Batal</h3>
                <p>Pesanan ini telah dibatalkan atau dikembalikan.</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between relative z-10 space-y-6 md:space-y-0">
                {STATUS_STEPS.map((step, idx) => {
                  const historyEntry = order.statusHistory.find((h: any) => h.status === step.id);
                  const isCompleted = !!historyEntry;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors z-10 border-4 border-background ${
                        isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div className={`font-medium text-sm ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                      {isCompleted && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(historyEntry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5" /> Alamat Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold">{order.deliveryAddress.recipientName}</p>
            <p>{order.deliveryAddress.phone}</p>
            <p className="text-muted-foreground mt-2">{order.deliveryAddress.addressLine}</p>
            <p className="text-muted-foreground">{order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="w-5 h-5" /> Informasi Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div>
              <span className="text-muted-foreground block mb-1">Kurir / Metode</span>
              <span className="font-semibold">{order.deliveryMethod}</span>
            </div>
            {order.deliveryJob?.driverId && (
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                <p className="font-medium text-primary mb-1">Driver Telah Diassign</p>
                <p className="text-muted-foreground text-xs">Pesanan Anda sedang diurus oleh mitra pengemudi kami.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="w-5 h-5" /> {order.store.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex gap-4">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-muted-foreground">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="font-semibold">
                Rp {(item.quantity * item.price).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="w-5 h-5" /> Rincian Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal Produk</span>
            <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkos Kirim</span>
            <span>Rp {order.deliveryFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">PPN 12%</span>
            <span>Rp {order.taxAmount.toLocaleString('id-ID')}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon</span>
              <span>- Rp {order.discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="border-t pt-4 mt-4 flex justify-between items-center">
            <span className="font-bold text-lg">Total Belanja</span>
            <span className="font-bold text-2xl text-primary">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
