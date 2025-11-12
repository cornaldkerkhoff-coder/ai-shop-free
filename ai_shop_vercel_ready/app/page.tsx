import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import { formatMoney } from "@/lib/format";

export default function HomePage(){
  const products = getAllProducts();
  return (
    <div className="space-y-8">
      <section className="rounded-2xl p-8 bg-gray-900 text-white">
        <h1 className="text-3xl md:text-4xl font-bold">AI Shop</h1>
        <p className="mt-2 text-gray-300">Volledig via GitHub & Vercel — geen lokale installatie nodig.</p>
      </section>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => (
          <Link key={p.id} href={`/product/${p.id}`} className="group rounded-2xl bg-white border shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{p.short_description}</p>
              <div className="mt-3 font-semibold">{formatMoney(p.price_cents,"EUR")}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}