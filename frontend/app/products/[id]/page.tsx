"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUser, AuthUser } from "@/lib/auth";

const DUMMY_PRODUCTS = [
  { id: "1", name: "Laptop Gaming X Pro", price: 15000000, storeName: "Toko Elektronik Jaya", stock: 10, description: "Laptop gaming super kencang dengan RTX 4060 dan RAM 16GB." },
  { id: "2", name: "Smartphone Y 5G", price: 5000000, storeName: "Toko Elektronik Jaya", stock: 25, description: "Smartphone 5G dengan kamera 108MP dan baterai 5000mAh." },
  { id: "3", name: "Sepatu Lari Z", price: 750000, storeName: "Toko Olahraga Maju", stock: 50, description: "Sepatu lari ringan dan nyaman untuk jarak jauh." },
  { id: "4", name: "Tas Ransel Anti Air", price: 350000, storeName: "Toko Olahraga Maju", stock: 100, description: "Tas ransel cocok untuk naik gunung atau ngantor." },
  { id: "5", name: "Headset Bluetooth", price: 250000, storeName: "Aksesoris Murah", stock: 30, description: "Headset dengan fitur noise cancellation." },
  { id: "6", name: "Kemeja Flanel Pria", price: 150000, storeName: "Fashion Pria Keren", stock: 20, description: "Kemeja flanel lengan panjang kualitas premium." },
];

export default function ProductDetail() {
  const { id } = useParams();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const product = DUMMY_PRODUCTS.find(p => p.id === id);

  if (!product) {
    return <div className="text-center py-20">Produk tidak ditemukan</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-slate-100 flex items-center justify-center text-6xl font-bold text-slate-300 rounded-lg">
          {product.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="text-3xl font-bold text-primary mb-6">
            Rp {product.price.toLocaleString("id-ID")}
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-1">Informasi Toko</p>
              <p className="text-lg">{product.storeName}</p>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Deskripsi Produk</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
          
          <div className="mb-8">
            <span className="text-sm font-semibold">Stok: </span>
            <span>{product.stock} tersisa</span>
          </div>

          <div className="mt-auto">
            {user?.activeRole === 'BUYER' ? (
              <Button size="lg" className="w-full text-lg">Tambah ke Keranjang</Button>
            ) : (
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" size="lg" className="w-full">
                  Login sebagai Pembeli untuk membeli
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
