'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function StorePage() {
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const res = await api.get('/seller/store');
      setStore(res.data);
      setName(res.data.name);
      setDescription(res.data.description || '');
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error('Gagal mengambil data toko');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (store) {
        await api.put('/seller/store', { name, description });
        toast.success('Toko berhasil diperbarui');
        setIsEditing(false);
      } else {
        await api.post('/seller/store', { name, description });
        toast.success('Toko berhasil dibuat');
      }
      fetchStore();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Terjadi kesalahan');
    }
  };

  if (isLoading) return <div>Memuat...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Manajemen Toko</h1>

      {!store || isEditing ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{store ? 'Edit Toko' : 'Buat Toko Baru'}</CardTitle>
            <CardDescription>Masukkan detail toko Anda untuk mulai berjualan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Toko</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mis. Toko Elektronik Jaya"
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsikan toko Anda..."
                  rows={4}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit">{store ? 'Simpan Perubahan' : 'Buat Toko'}</Button>
                {store && (
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{store.name}</CardTitle>
            <CardDescription>Toko Anda sudah aktif</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
              <p className="mt-1">{store.description || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jumlah Produk Aktif</p>
              <p className="mt-1">{store._count?.products || 0} Produk</p>
            </div>
            <Button onClick={() => setIsEditing(true)}>Edit Profil Toko</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
