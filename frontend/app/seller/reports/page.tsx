'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function SellerReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/seller/reports');
        setReport(res.data);
      } catch (err) {
        toast.error('Gagal memuat laporan pendapatan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (isLoading) return <div>Memuat laporan...</div>;
  if (!report) return <div>Data tidak tersedia.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Laporan Pendapatan Toko</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan (Selesai)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Rp {report.totalIncome?.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Pesanan Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{report.completedOrdersCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pendapatan per Bulan</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => `Rp ${val.toLocaleString('id-ID')}`} />
              <Tooltip formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`} />
              <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
