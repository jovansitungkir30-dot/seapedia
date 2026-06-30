'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Box, Clock, Truck } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const links = [
  { href: "/driver/dashboard", label: "Pekerjaan" },
];

export default function DriverDashboard() {
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/driver/jobs'),
        api.get('/driver/my-jobs')
      ]);
      setAvailableJobs(availRes.data);
      setMyJobs(myRes.data);
    } catch (err) {
      toast.error('Gagal memuat pekerjaan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (jobId: string, action: string) => {
    try {
      await api.patch(`/driver/jobs/${jobId}/${action}`);
      toast.success(`Aksi berhasil`);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || `Gagal melakukan aksi`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MENCARI_DRIVER': return <Badge variant="secondary">Mencari Driver</Badge>;
      case 'DRIVER_MENUJU_TOKO': return <Badge variant="default" className="bg-blue-500">Menuju Toko</Badge>;
      case 'SEDANG_DIKIRIM': return <Badge variant="default" className="bg-amber-500">Sedang Dikirim</Badge>;
      case 'SELESAI': return <Badge variant="default" className="bg-green-500">Selesai</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) return <div>Memuat data pengiriman...</div>;

  return (
    <DashboardLayout role="DRIVER" links={links}>
      <h1 className="text-2xl font-bold mb-6">Dashboard Driver</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Pekerjaan Aktif Anda
          </h2>
          {myJobs.filter(j => j.status !== 'SELESAI').length === 0 ? (
            <div className="text-muted-foreground p-4 bg-slate-50 rounded-lg text-center border">
              Belum ada pekerjaan aktif. Silakan ambil pekerjaan yang tersedia.
            </div>
          ) : (
            <div className="space-y-4">
              {myJobs.filter(j => j.status !== 'SELESAI').map(job => (
                <Card key={job.id} className="border-primary/50 bg-primary/5 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Pesanan #{job.orderId.substring(0, 8).toUpperCase()}</CardTitle>
                      {getStatusBadge(job.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="font-semibold flex items-center gap-2 text-muted-foreground"><Box className="w-4 h-4"/> Ambil dari:</div>
                      <p className="ml-6 font-medium">{job.order.store.name}</p>
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4"/> Antar ke:</div>
                      <p className="ml-6">{job.order.deliveryAddress.recipientName}</p>
                      <p className="ml-6 text-xs text-muted-foreground">{job.order.deliveryAddress.addressLine}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    {job.status === 'DRIVER_MENUJU_TOKO' && (
                      <Button className="w-full" onClick={() => handleAction(job.id, 'pickup')}>
                        Saya Sudah di Toko (Ambil Barang)
                      </Button>
                    )}
                    {job.status === 'SEDANG_DIKIRIM' && (
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleAction(job.id, 'complete')}>
                        Selesaikan Pengantaran
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" /> Pekerjaan Tersedia
          </h2>
          {availableJobs.length === 0 ? (
            <div className="text-muted-foreground p-4 bg-slate-50 rounded-lg text-center border">
              Tidak ada pekerjaan baru saat ini.
            </div>
          ) : (
            <div className="space-y-4">
              {availableJobs.map(job => (
                <Card key={job.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Pesanan #{job.orderId.substring(0, 8).toUpperCase()}</CardTitle>
                      <span className="font-bold text-primary">Rp {job.order.deliveryFee.toLocaleString('id-ID')}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Box className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                      <div>
                        <span className="font-semibold block">Toko</span>
                        <span>{job.order.store.name}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                      <div>
                        <span className="font-semibold block">Tujuan</span>
                        <span>{job.order.deliveryAddress.city}, {job.order.deliveryAddress.province}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleAction(job.id, 'accept')} disabled={myJobs.some(j => j.status !== 'SELESAI')}>
                      {myJobs.some(j => j.status !== 'SELESAI') ? 'Selesaikan pesanan aktif dulu' : 'Terima Pekerjaan'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
