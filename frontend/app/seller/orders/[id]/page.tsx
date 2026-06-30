'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, PackageOpen, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const STATUS_STEPS = [
  { id: 'SEDANG_DIKEMAS', label: 'Pesanan Baru', icon: PackageOpen },
  { id: 'MENUNGGU_PENGIRIM', label: 'Menunggu Pengirim', icon: Clock },
  { id: 'SEDANG_DIKIRIM', label: 'Sedang Dikirim', icon: Truck },
  { id: 'PESANAN_SELESAI', label: 'Selesai', icon: CheckCircle2 },
];

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/seller/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        toast.error('Gagal mengambil detail pesanan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessOrder = async () => {
    setIsProcessing(true);
    try {
      await api.patch(`/seller/orders/${id}/process`);
      toast.success('Pesanan berhasil diproses menjadi Menunggu Pengirim');
      const res = await api.get(`/seller/orders/${id}`);
      setOrder(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memproses pesanan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestPickup = async () => {
    setIsProcessing(true);
    try {
      await api.patch(`/seller/orders/${id}/request-pickup`);
      toast.success('Berhasil request pickup. Menunggu driver...');
      const res = await api.get(`/seller/orders/${id}`);
      setOrder(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memanggil kurir');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div>Memuat detail pesanan...</div>;
  if (!order) return <div>Pesanan tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Detail Pesanan Masuk
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
                <h3 className="font-bold text-lg mb-2">Pesanan Batal</h3>
                <p>Pesanan ini telah dibatalkan.</p>
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
              <MapPin className="w-5 h-5" /> Alamat Pembeli
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-bold mb-2 text-primary">{order.buyer.username}</p>
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
              <span className="text-muted-foreground block mb-1">Metode Pengiriman (Dipilih Pembeli)</span>
              <span className="font-semibold">{order.deliveryMethod}</span>
            </div>
            
            {order.status === 'SEDANG_DIKEMAS' && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex justify-between items-center">
                <div>
                  <p className="text-amber-800 font-medium mb-1">Segera Siapkan Barang!</p>
                  <p className="text-amber-700 text-xs">Pesanan ini menunggu untuk diproses.</p>
                </div>
                <Button onClick={handleProcessOrder} disabled={isProcessing}>
                  {isProcessing ? 'Memproses...' : 'Proses Pesanan'}
                </Button>
              </div>
            )}
            
            {order.status === 'MENUNGGU_PENGIRIM' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex justify-between items-center">
                <div>
                  <p className="text-blue-800 font-medium mb-1">Barang Siap Di-pickup?</p>
                  <p className="text-blue-700 text-xs">Panggil kurir untuk mengambil barang.</p>
                </div>
                <Button onClick={handleRequestPickup} disabled={isProcessing}>
                  {isProcessing ? 'Memanggil...' : 'Request Pickup'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Daftar Produk yang Dipesan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm border-b pb-4 last:border-0 last:pb-0">
              <div className="flex gap-4">
                <div>
                  <p className="font-medium text-base">{item.productName}</p>
                  <p className="text-muted-foreground mt-1">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="font-semibold text-right">
                Rp {(item.quantity * item.price).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
          <div className="pt-4 flex justify-between items-center">
            <span className="font-bold text-lg">Total Pendapatan (Kotor)</span>
            <span className="font-bold text-2xl text-primary">Rp {(order.totalAmount - order.deliveryFee).toLocaleString('id-ID')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
