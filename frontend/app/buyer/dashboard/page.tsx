import DashboardLayout from "@/components/layout/DashboardLayout";

const links = [
  { href: "/buyer/dashboard", label: "Beranda" },
  { href: "/buyer/wallet", label: "Dompet" },
  { href: "/buyer/addresses", label: "Alamat" },
  { href: "/buyer/cart", label: "Keranjang" },
  { href: "/buyer/orders", label: "Pesanan" },
  { href: "/buyer/reports", label: "Laporan" },
];

export default function BuyerDashboard() {
  return (
    <DashboardLayout role="BUYER" links={links}>
      <h1 className="text-2xl font-bold mb-4">Selamat Datang, Pembeli!</h1>
      <p className="text-muted-foreground">Pilih menu di samping untuk mengelola akun Anda.</p>
    </DashboardLayout>
  );
}
