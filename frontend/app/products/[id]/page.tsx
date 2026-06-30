'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
              {/* This button will be fully functional in Level 3 */}
              <Button size="lg" className="flex-1 text-lg">
                Beli Sekarang
              </Button>
              <Button size="lg" variant="outline" className="flex-1 text-lg">
                Tambah ke Keranjang
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
