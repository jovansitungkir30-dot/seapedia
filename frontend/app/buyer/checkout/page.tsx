'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Truck, Wallet, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

const DELIVERY_METHODS = [
  { id: 'INSTANT', name: 'Instant', time: '1-3 Jam', fee: 25000 },
  { id: 'NEXT_DAY', name: 'Next Day', time: '1 Hari', fee: 15000 },
  { id: 'REGULAR', name: 'Regular', time: '2-5 Hari', fee: 9000 },
];

export default function BuyerCheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Level 4
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, discount: number} | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, addressRes, walletRes] = await Promise.all([
          api.get('/buyer/cart'),
          api.get('/buyer/addresses'),
          api.get('/buyer/wallet'),
        ]);
        
        if (!cartRes.data.items?.length) {
          router.replace('/buyer/cart');
          return;
        }

        setCart(cartRes.data);
        setAddresses(addressRes.data);
        setWallet(walletRes.data);

        const defaultAddr = addressRes.data.find((a: any) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);

      } catch (err) {
        toast.error('Gagal mengambil data checkout');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const deliveryFee = selectedMethod ? DELIVERY_METHODS.find(m => m.id === selectedMethod)?.fee || 0 : 0;
  const subtotal = cart?.subtotal || 0;
  
  const handleApplyVoucher = async () => {
    if (!voucherCodeInput) return;
    setIsApplyingVoucher(true);
    try {
      const res = await api.get(`/vouchers/validate?code=${voucherCodeInput}&subtotal=${subtotal}`);
      if (res.data.valid) {
        setAppliedVoucher({ code: voucherCodeInput, discount: res.data.discountAmount });
        toast.success('Voucher berhasil digunakan!');
      } else {
        toast.error(res.data.reason || 'Voucher tidak valid');
        setAppliedVoucher(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.reason || 'Voucher tidak valid');
      setAppliedVoucher(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput) return;
    setIsApplyingPromo(true);
    try {
      const currentSubtotal = subtotal - (appliedVoucher?.discount || 0);
      const res = await api.get(`/promos/validate?code=${promoCodeInput}&subtotal=${currentSubtotal}`);
      if (res.data.valid) {
        setAppliedPromo({ code: promoCodeInput, discount: res.data.discountAmount });
        toast.success('Promo berhasil digunakan!');
      } else {
        toast.error(res.data.reason || 'Promo tidak valid');
        setAppliedPromo(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.reason || 'Promo tidak valid');
      setAppliedPromo(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const discountAmount = (appliedVoucher?.discount || 0) + (appliedPromo?.discount || 0);
  const taxBase = subtotal - discountAmount + deliveryFee;
  const taxAmount = taxBase * 0.12;
  const totalAmount = taxBase + taxAmount;
  const hasEnoughBalance = (wallet?.balance || 0) >= totalAmount;

  const handleCheckout = async () => {
    if (!selectedAddressId) return toast.error('Pilih alamat pengiriman');
    if (!selectedMethod) return toast.error('Pilih metode pengiriman');
    if (!hasEnoughBalance) return toast.error('Saldo tidak mencukupi');

    setIsSubmitting(true);
    try {
      const res = await api.post('/buyer/checkout', {
        deliveryAddressId: selectedAddressId,
        deliveryMethod: selectedMethod,
        voucherCode: appliedVoucher?.code,
        promoCode: appliedPromo?.code,
      });
      toast.success('Pesanan berhasil dibuat!');
      router.push(`/buyer/orders/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Checkout gagal');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Menyiapkan checkout...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-primary" /> Alamat Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!addresses.length ? (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">Anda belum memiliki alamat.</p>
                  <Link href="/buyer/addresses" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    Tambah Alamat Baru
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className={`p-4 border rounded-lg flex gap-4 cursor-pointer transition-colors ${selectedAddressId === address.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`} onClick={() => setSelectedAddressId(address.id)}>
                      <input type="radio" checked={selectedAddressId === address.id} readOnly className="mt-1" />
                      <div className="flex-1 text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{address.recipientName}</span>
                          <span className="text-muted-foreground">({address.label})</span>
                          {address.isDefault && <Badge variant="secondary" className="text-xs">Utama</Badge>}
                        </div>
                        <p>{address.phone}</p>
                        <p className="text-muted-foreground">{address.addressLine}, {address.city}, {address.province} {address.postalCode}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-right">
                    <Link href="/buyer/addresses" className="text-sm text-primary hover:underline">Kelola Alamat</Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="w-5 h-5 text-primary" /> Metode Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {DELIVERY_METHODS.map((method) => (
                  <div key={method.id} className={`p-4 border rounded-lg text-center cursor-pointer transition-colors ${selectedMethod === method.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`} onClick={() => setSelectedMethod(method.id)}>
                    <div className="font-semibold">{method.name}</div>
                    <div className="text-xs text-muted-foreground my-1">{method.time}</div>
                    <div className="font-bold text-primary mt-2">Rp {method.fee.toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Produk ({cart.store?.name})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                      {item.product.imageUrl ? <img src={item.product.imageUrl} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-muted-foreground">{item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    Rp {(item.quantity * item.product.price).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Makin Hemat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Kode Voucher" 
                  value={voucherCodeInput} 
                  onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                  disabled={!!appliedVoucher || isApplyingVoucher}
                />
                {!appliedVoucher ? (
                  <Button variant="outline" onClick={handleApplyVoucher} disabled={!voucherCodeInput || isApplyingVoucher}>
                    Terapkan
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => { setAppliedVoucher(null); setVoucherCodeInput(''); }}>
                    Hapus
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Kode Promo" 
                  value={promoCodeInput} 
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  disabled={!!appliedPromo || isApplyingPromo}
                />
                {!appliedPromo ? (
                  <Button variant="outline" onClick={handleApplyPromo} disabled={!promoCodeInput || isApplyingPromo}>
                    Terapkan
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => { setAppliedPromo(null); setPromoCodeInput(''); }}>
                    Hapus
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Ringkasan Belanja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal Barang</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Voucher ({appliedVoucher.code})</span>
                  <span>-Rp {appliedVoucher.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {appliedPromo && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Promo ({appliedPromo.code})</span>
                  <span>-Rp {appliedPromo.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span>Rp {deliveryFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPN (12%)</span>
                <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Tagihan</span>
                  <span className="font-bold text-lg text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Wallet className="w-4 h-4" /> Saldo SEAPEDIA Pay
                  </div>
                  <span className="font-semibold">Rp {wallet?.balance.toLocaleString('id-ID')}</span>
                </div>
                {!hasEnoughBalance && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mt-2">
                    Saldo Anda tidak mencukupi untuk pembayaran ini. Silakan top up terlebih dahulu.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleCheckout}
                disabled={!selectedAddressId || !selectedMethod || !hasEnoughBalance || isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
