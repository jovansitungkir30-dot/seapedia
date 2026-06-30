'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/api';

export default function StorePublicPage() {
  const params = useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get(`/stores/${params.id}`);
        setStore(res.data.store);
        setProducts(res.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStore();
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

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          Toko tidak ditemukan.
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-primary/5 rounded-xl p-8 mb-12 text-center max-w-3xl mx-auto border border-primary/10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{store.name}</h1>
          <p className="text-muted-foreground text-lg mb-4">
            {store.description || 'Tidak ada deskripsi'}
          </p>
          <div className="text-sm font-medium">
            Pemilik: {store.seller?.username}
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-6">Produk Toko</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg">
            Toko ini belum memiliki produk aktif.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <h3 className="font-semibold line-clamp-1 text-lg mb-1">{product.name}</h3>
                  <p className="text-primary font-bold text-lg mt-2">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/products/${product.id}`} className={buttonVariants({ className: "w-full" })}>
                    Lihat Detail
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
