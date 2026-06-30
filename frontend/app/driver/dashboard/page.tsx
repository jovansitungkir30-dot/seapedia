import DashboardLayout from "@/components/layout/DashboardLayout";

const links = [
  { href: "/driver/dashboard", label: "Beranda" },
  { href: "/driver/jobs", label: "Cari Pekerjaan" },
  { href: "/driver/my-jobs", label: "Pekerjaan Saya" },
  { href: "/driver/earnings", label: "Penghasilan" },
];

export default function DriverDashboard() {
  return (
    <DashboardLayout role="DRIVER" links={links}>
      <h1 className="text-2xl font-bold mb-4">Selamat Datang, Pengemudi!</h1>
      <p className="text-muted-foreground">Ambil pekerjaan pengiriman dan kelola penghasilan Anda.</p>
    </DashboardLayout>
  );
}
