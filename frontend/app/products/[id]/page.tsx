'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [conflictData, setConflictData] = useState<{ currentStoreId: string } | null>(null);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await api.post('/buyer/cart/items', { productId: params.id, quantity: 1 });
      toast.success('Berhasil ditambahkan ke keranjang');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflictData({ currentStoreId: err.response.data.currentStoreId });
      } else if (err.response?.status === 401) {
        toast.error('Silakan login sebagai Pembeli terlebih dahulu');
        router.push('/auth/login');
      } else {
        toast.error(err.response?.data?.error || 'Gagal menambahkan ke keranjang');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleClearAndAdd = async () => {
    try {
      await api.delete('/buyer/cart'); // Clear cart
      await api.post('/buyer/cart/items', { productId: params.id, quantity: 1 }); // Add item
      toast.success('Keranjang dikosongkan dan produk ditambahkan');
      setConflictData(null);
    } catch (err) {
      toast.error('Gagal memproses permintaan');
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${params.id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          Memuat...
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          Produk tidak ditemukan.
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image Placeholder */}
          <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <span className="text-muted-foreground text-lg">Gambar Produk</span>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
            <Link href={`/stores/${product.storeId}`} className="text-lg text-muted-foreground hover:underline mb-6 block">
              {product.store?.name}
            </Link>

            <div className="text-3xl font-bold text-primary mb-6">
              Rp {product.price.toLocaleString('id-ID')}
            </div>

            <div className="prose prose-sm max-w-none mb-8">
              <h3 className="text-lg font-semibold mb-2">Deskripsi Produk</h3>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mb-8">
              <span className="text-sm font-medium text-muted-foreground">Stok Tersedia:</span>
              <span className="ml-2 font-semibold">{product.stock}</span>
            </div>

            <div className="flex gap-4 mt-auto">
              <Button size="lg" className="flex-1 text-lg">
                Beli Sekarang
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 text-lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Conflict Modal */}
      {conflictData && (
        <Dialog open={!!conflictData} onOpenChange={() => setConflictData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ganti Toko?</DialogTitle>
              <DialogDescription>
                Keranjang Anda saat ini berisi produk dari toko lain. Karena sistem checkout kami mengharuskan pembelian dari satu toko saja, apakah Anda ingin mengosongkan keranjang sebelumnya dan menambahkan produk ini?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConflictData(null)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleClearAndAdd}>
                Kosongkan & Tambah
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
