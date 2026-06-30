'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { WalletIcon, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import api from '@/lib/api';

export default function BuyerWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/buyer/wallet');
      setWallet(res.data);
    } catch (err) {
      toast.error('Gagal mengambil data dompet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) {
      toast.error('Jumlah tidak valid');
      return;
    }

    setIsToppingUp(true);
    try {
      await api.post('/buyer/wallet/topup', { amount });
      toast.success('Top up berhasil!');
      setTopupAmount('');
      fetchWallet();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal top up');
    } finally {
      setIsToppingUp(false);
    }
  };

  if (isLoading) return <div>Memuat data dompet...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dompet Saya</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon />
              Saldo Aktif
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Total saldo SEAPEDIA Pay Anda saat ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-6">
              Rp {wallet?.balance?.toLocaleString('id-ID') || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Up Saldo</CardTitle>
            <CardDescription>Tambah saldo untuk mempermudah transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTopup} className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {[50000, 100000, 500000, 1000000].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant="outline"
                    onClick={() => setTopupAmount(val.toString())}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </Button>
                ))}
              </div>
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="Atau masukkan jumlah lainnya..."
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min="1"
                  className="flex-1"
                />
                <Button type="submit" disabled={isToppingUp || !topupAmount}>
                  Top Up Sekarang
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>20 transaksi terakhir Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {!wallet?.transactions?.length ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada riwayat transaksi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-4 font-medium text-muted-foreground">Tanggal</th>
                    <th className="p-4 font-medium text-muted-foreground">Tipe</th>
                    <th className="p-4 font-medium text-muted-foreground">Deskripsi</th>
                    <th className="p-4 font-medium text-muted-foreground text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b">
                      <td className="p-4 align-middle">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 align-middle">
                        {tx.type === 'TOPUP' && <Badge className="bg-green-500"><ArrowDownRight className="w-3 h-3 mr-1"/> TOPUP</Badge>}
                        {tx.type === 'PAYMENT' && <Badge variant="destructive"><ArrowUpRight className="w-3 h-3 mr-1"/> PAYMENT</Badge>}
                        {tx.type === 'REFUND' && <Badge className="bg-blue-500"><RefreshCcw className="w-3 h-3 mr-1"/> REFUND</Badge>}
                      </td>
                      <td className="p-4 align-middle">{tx.description}</td>
                      <td className={`p-4 align-middle text-right font-semibold ${
                        ['TOPUP', 'REFUND'].includes(tx.type) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {['TOPUP', 'REFUND'].includes(tx.type) ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
