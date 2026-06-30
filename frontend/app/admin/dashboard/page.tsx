import DashboardLayout from "@/components/layout/DashboardLayout";

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

export default function AdminDashboard() {
  return (
    <DashboardLayout role="ADMIN" links={links}>
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="text-muted-foreground">Pantau dan kelola seluruh platform SEAPEDIA.</p>
    </DashboardLayout>
  );
}
