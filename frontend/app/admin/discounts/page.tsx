'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';

const links = [
  { href: "/admin/dashboard", label: "Beranda" },
  { href: "/admin/users", label: "Pengguna" },
  { href: "/admin/stores", label: "Toko" },
  { href: "/admin/products", label: "Produk" },
  { href: "/admin/orders", label: "Pesanan" },
  { href: "/admin/discounts", label: "Diskon" },
  { href: "/admin/deliveries", label: "Pengiriman" },
  { href: "/admin/late-orders", label: "Pesanan Terlambat" },
];

export default function AdminDiscounts() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  
  const [voucherForm, setVoucherForm] = useState({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: 0, maxUsage: 0, expiresAt: '' });
  const [promoForm, setPromoForm] = useState({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: 0, expiresAt: '' });

  const fetchDiscounts = async () => {
    try {
      const [vRes, pRes] = await Promise.all([
        api.get('/admin/vouchers'),
        api.get('/admin/promos')
      ]);
      setVouchers(vRes.data);
      setPromos(pRes.data);
    } catch (err) {
      toast.error('Gagal mengambil data diskon');
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/vouchers', voucherForm);
      toast.success('Voucher berhasil dibuat');
      setVoucherForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: 0, maxUsage: 0, expiresAt: '' });
      fetchDiscounts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal membuat voucher');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/promos', promoForm);
      toast.success('Promo berhasil dibuat');
      setPromoForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: 0, expiresAt: '' });
      fetchDiscounts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal membuat promo');
    }
  };

  return (
    <DashboardLayout role="ADMIN" links={links}>
      <h1 className="text-2xl font-bold mb-6">Manajemen Diskon</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Buat Voucher Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <Input placeholder="Kode Voucher" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})} required />
              <Input placeholder="Deskripsi" value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})} required />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={voucherForm.discountType} onChange={e => setVoucherForm({...voucherForm, discountType: e.target.value})}>
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal (Rp)</option>
              </select>
              <Input type="number" placeholder="Nilai Diskon" value={voucherForm.discountValue || ''} onChange={e => setVoucherForm({...voucherForm, discountValue: Number(e.target.value)})} required />
              <Input type="number" placeholder="Minimal Belanja" value={voucherForm.minOrderAmount || ''} onChange={e => setVoucherForm({...voucherForm, minOrderAmount: Number(e.target.value)})} required />
              <Input type="number" placeholder="Maksimal Penggunaan" value={voucherForm.maxUsage || ''} onChange={e => setVoucherForm({...voucherForm, maxUsage: Number(e.target.value)})} required />
              <Input type="datetime-local" value={voucherForm.expiresAt} onChange={e => setVoucherForm({...voucherForm, expiresAt: e.target.value})} required />
              <Button type="submit">Buat Voucher</Button>
            </form>

            <div className="mt-8 space-y-4">
              <h3 className="font-semibold">Daftar Voucher</h3>
              {vouchers.map(v => (
                <div key={v.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold">{v.code}</div>
                    <div className="text-sm text-muted-foreground">{v.description}</div>
                    <div className="text-xs mt-1">Sisa: {v.maxUsage - v.usedCount} penggunaan</div>
                  </div>
                  <Badge variant={v.status === 'ACTIVE' ? 'default' : 'secondary'}>{v.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buat Promo Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePromo} className="space-y-4">
              <Input placeholder="Kode Promo" value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value})} required />
              <Input placeholder="Deskripsi" value={promoForm.description} onChange={e => setPromoForm({...promoForm, description: e.target.value})} required />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={promoForm.discountType} onChange={e => setPromoForm({...promoForm, discountType: e.target.value})}>
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal (Rp)</option>
              </select>
              <Input type="number" placeholder="Nilai Diskon" value={promoForm.discountValue || ''} onChange={e => setPromoForm({...promoForm, discountValue: Number(e.target.value)})} required />
              <Input type="number" placeholder="Minimal Belanja" value={promoForm.minOrderAmount || ''} onChange={e => setPromoForm({...promoForm, minOrderAmount: Number(e.target.value)})} required />
              <Input type="datetime-local" value={promoForm.expiresAt} onChange={e => setPromoForm({...promoForm, expiresAt: e.target.value})} required />
              <Button type="submit">Buat Promo</Button>
            </form>

            <div className="mt-8 space-y-4">
              <h3 className="font-semibold">Daftar Promo</h3>
              {promos.map(p => (
                <div key={p.id} className="p-4 border rounded-lg">
                  <div className="font-bold">{p.code}</div>
                  <div className="text-sm text-muted-foreground">{p.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
