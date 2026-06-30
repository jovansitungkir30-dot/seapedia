'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Store as StoreIcon, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function BuyerCartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get('/buyer/cart');
      setCart(res.data);
    } catch (err) {
      toast.error('Gagal mengambil keranjang');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await api.put(`/buyer/cart/items/${itemId}`, { quantity: newQty });
      fetchCart();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengubah jumlah');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/buyer/cart/items/${itemId}`);
      toast.success('Produk dihapus dari keranjang');
      fetchCart();
    } catch (err) {
      toast.error('Gagal menghapus produk');
    }
  };

  const clearCart = async () => {
    if (!confirm('Kosongkan semua isi keranjang?')) return;
    try {
      await api.delete('/buyer/cart');
      toast.success('Keranjang dikosongkan');
      fetchCart();
    } catch (err) {
      toast.error('Gagal mengosongkan keranjang');
    }
  };

  if (isLoading) return <div>Memuat keranjang...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Keranjang Belanja
        </h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
        <div className="text-sm">
          <strong>Perhatian:</strong> SEAPEDIA menggunakan sistem single-store checkout. Satu keranjang hanya bisa berisi produk dari 1 toko.
        </div>
      </div>

      {!cart?.items?.length ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="mb-2">Keranjang Anda kosong</CardTitle>
          <div className="text-muted-foreground mb-6">Mulai belanja dan temukan barang menarik!</div>
          <Link href="/products" className={buttonVariants()}>
            Mulai Belanja
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <StoreIcon className="w-5 h-5 text-primary" />
                    {cart.store?.name}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    Kosongkan
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No Image</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{item.product.name}</h3>
                        <p className="font-bold text-primary mt-1">Rp {item.product.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.id, item.quantity, -1)} disabled={item.quantity <= 1}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <div className="w-10 text-center text-sm font-medium">{item.quantity}</div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.id, item.quantity, 1)} disabled={item.product.stock <= item.quantity}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Ringkasan Belanja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Harga ({cart.items.reduce((a: any, b: any) => a + b.quantity, 0)} barang)</span>
                  <span className="font-semibold">Rp {cart.subtotal.toLocaleString('id-ID')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full text-lg h-12" onClick={() => router.push('/buyer/checkout')}>
                  Lanjut Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
