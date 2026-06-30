'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/seller/products');
      setProducts(res.data);
    } catch (err: any) {
      toast.error('Gagal mengambil daftar produk');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (err: any) {
      toast.error('Gagal menghapus produk');
    }
  };

  if (isLoading) return <div>Memuat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Daftar Produk</h1>
        <Link href="/seller/products/new" className={buttonVariants()}>
          Tambah Produk
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Harga</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stok</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      Belum ada produk.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{product.name}</td>
                      <td className="p-4 align-middle">Rp {product.price.toLocaleString('id-ID')}</td>
                      <td className="p-4 align-middle">{product.stock}</td>
                      <td className="p-4 align-middle">
                        {product.isActive ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Tidak Aktif</Badge>
                        )}
                      </td>
                      <td className="p-4 align-middle text-right space-x-2">
                        <Link href={`/seller/products/${product.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                          Edit
                        </Link>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
