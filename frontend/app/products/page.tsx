"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Dummy data for Level 1
const DUMMY_PRODUCTS = [
  { id: "1", name: "Laptop Gaming X Pro", price: 15000000, storeName: "Toko Elektronik Jaya", stock: 10 },
  { id: "2", name: "Smartphone Y 5G", price: 5000000, storeName: "Toko Elektronik Jaya", stock: 25 },
  { id: "3", name: "Sepatu Lari Z", price: 750000, storeName: "Toko Olahraga Maju", stock: 50 },
  { id: "4", name: "Tas Ransel Anti Air", price: 350000, storeName: "Toko Olahraga Maju", stock: 100 },
  { id: "5", name: "Headset Bluetooth", price: 250000, storeName: "Aksesoris Murah", stock: 30 },
  { id: "6", name: "Kemeja Flanel Pria", price: 150000, storeName: "Fashion Pria Keren", stock: 20 },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filtered = DUMMY_PRODUCTS.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Katalog Produk</h1>
        <div className="w-full md:w-72">
          <Input 
            placeholder="Cari produk..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Produk tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <div className="aspect-square bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-300">
                {product.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
              </div>
              <CardHeader className="flex-1 pb-2">
                <CardTitle className="text-lg line-clamp-2" title={product.name}>
                  {product.name}
                </CardTitle>
                <div className="text-xl font-bold text-primary mt-2">
                  Rp {product.price.toLocaleString("id-ID")}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <span className="truncate">{product.storeName}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/products/${product.id}`} className="w-full">
                  <Button variant="outline" className="w-full">Lihat Detail</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
