'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get('/seller/products');
        const product = res.data.find((p: any) => p.id === params.id);
        if (!product) {
          toast.error('Produk tidak ditemukan');
          router.push('/seller/products');
          return;
        }
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          stock: product.stock.toString(),
          imageUrl: product.imageUrl || '',
          isActive: product.isActive,
        });
      } catch (err) {
        toast.error('Gagal mengambil data produk');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/seller/products/${params.id}`, {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });
      toast.success('Produk berhasil diperbarui');
      router.push('/seller/products');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui produk');
    }
  };

  if (isLoading) return <div>Memuat...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Produk</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
          <CardDescription>Ubah rincian produk Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Produk</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Harga (Rp)</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stok</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Gambar (Opsional)</label>
              <Input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Produk Aktif (Tampil di Katalog)
              </label>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit">Simpan Perubahan</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/seller/products')}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
