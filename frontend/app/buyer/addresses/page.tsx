'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Plus, Star } from 'lucide-react';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function BuyerAddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: '', recipientName: '', phone: '',
    addressLine: '', city: '', province: '', postalCode: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/buyer/addresses');
      setAddresses(res.data);
    } catch (err) {
      toast.error('Gagal mengambil data alamat');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/buyer/addresses', formData);
      toast.success('Alamat berhasil ditambahkan');
      setIsModalOpen(false);
      setFormData({
        label: '', recipientName: '', phone: '',
        addressLine: '', city: '', province: '', postalCode: '',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan alamat');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus alamat ini?')) return;
    try {
      await api.delete(`/buyer/addresses/${id}`);
      toast.success('Alamat dihapus');
      fetchAddresses();
    } catch (err) {
      toast.error('Gagal menghapus alamat');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/buyer/addresses/${id}/default`);
      toast.success('Alamat utama diubah');
      fetchAddresses();
    } catch (err) {
      toast.error('Gagal mengatur alamat utama');
    }
  };

  if (isLoading) return <div>Memuat alamat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Daftar Alamat</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger className={buttonVariants()}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Alamat
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Alamat Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label Alamat (Contoh: Rumah, Kantor)</label>
                <Input value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Penerima</label>
                <Input value={formData.recipientName} onChange={(e) => setFormData({...formData, recipientName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nomor Telepon</label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alamat Lengkap</label>
                <Input value={formData.addressLine} onChange={(e) => setFormData({...formData, addressLine: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kota/Kabupaten</label>
                  <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provinsi</label>
                  <Input value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kode Pos</label>
                <Input value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} required />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData({...formData, isDefault: e.target.checked})} className="h-4 w-4" />
                <label htmlFor="isDefault" className="text-sm font-medium">Jadikan alamat utama</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!addresses.length ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="mb-2">Belum ada alamat</CardTitle>
          <CardDescription>Tambahkan alamat pengiriman untuk mempermudah checkout.</CardDescription>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? 'border-primary/50 bg-primary/5' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {address.label}
                    {address.isDefault && <Badge variant="default" className="text-xs">Utama</Badge>}
                  </CardTitle>
                  {!address.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)}>
                      <Star className="w-4 h-4 mr-2" />
                      Jadikan Utama
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-semibold text-base">{address.recipientName}</p>
                <p className="text-muted-foreground">{address.phone}</p>
                <p className="mt-2">{address.addressLine}</p>
                <p>{address.city}, {address.province} {address.postalCode}</p>
              </CardContent>
              <CardFooter className="pt-0 justify-end">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(address.id)}>Hapus</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
