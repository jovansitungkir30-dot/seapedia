import DashboardLayout from "@/components/layout/DashboardLayout";

const links = [
  { href: "/seller/dashboard", label: "Beranda" },
  { href: "/seller/store", label: "Toko Saya" },
  { href: "/seller/products", label: "Produk" },
  { href: "/seller/orders", label: "Pesanan" },
  { href: "/seller/reports", label: "Laporan" },
];

export default function SellerDashboard() {
  return (
    <DashboardLayout role="SELLER" links={links}>
      <h1 className="text-2xl font-bold mb-4">Selamat Datang, Penjual!</h1>
      <p className="text-muted-foreground">Kelola toko dan pesanan Anda di sini.</p>
    </DashboardLayout>
  );
}
