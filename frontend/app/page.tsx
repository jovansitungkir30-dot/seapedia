"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews");
      setReviews(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/reviews", { reviewerName: name, rating, comment });
      toast.success("Review submitted successfully");
      setName("");
      setRating(5);
      setComment("");
      fetchReviews();
    } catch (error: any) {
      toast.error("Failed to submit review");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20 text-center">
        <h1 className="text-5xl font-extrabold mb-4">SEAPEDIA</h1>
        <p className="text-xl mb-8">Marketplace yang menghubungkan Pembeli, Penjual, dan Pengemudi</p>
        <Link href="/products">
          <Button size="lg" variant="secondary" className="font-bold text-lg">Jelajahi Produk</Button>
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader><CardTitle>Pembeli</CardTitle></CardHeader>
          <CardContent><p>Temukan produk impianmu dengan harga terbaik dan pilihan toko terlengkap.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Penjual</CardTitle></CardHeader>
          <CardContent><p>Buka tokomu sekarang dan jangkau ribuan pelanggan di seluruh Indonesia.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pengemudi</CardTitle></CardHeader>
          <CardContent><p>Ambil pekerjaan pengiriman, antar barang dengan aman, dan dapatkan penghasilan.</p></CardContent>
        </Card>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Apa Kata Mereka?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{r.reviewerName}</span>
                    <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </CardTitle>
                  <CardDescription>{new Date(r.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{r.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-xl mx-auto">
            <CardHeader><CardTitle>Tinggalkan Ulasan</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submitReview} className="space-y-4">
                <Input placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} required />
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={rating} onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Bintang</option>)}
                </select>
                <Textarea placeholder="Komentar Anda" value={comment} onChange={(e) => setComment(e.target.value)} required />
                <Button type="submit" className="w-full">Kirim Ulasan</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
