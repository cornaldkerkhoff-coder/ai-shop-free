import Image from "next/image";
import { getProductById } from "@/lib/products";
import { formatMoney } from "@/lib/format";

export default function ProductPage({ params }: { params: { id: string }}){
  const p = getProductById(params.id);
  if (!p) return <div className="p-8">Product niet gevonden.</div>;

  async function buy(){
    "use server";
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/checkout`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id })
    });
    const data = await res.json();
    if (data.ok) return { redirect: `/thank-you?order=${data.orderId}` };
    throw new Error("Bestellen mislukt");
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border">
        <Image src={p.image} alt={p.name} fill className="object-cover"/>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <div className="mt-2 text-lg font-semibold">{formatMoney(p.price_cents,"EUR")}</div>
        <p className="mt-4 text-gray-700">{p.long_description}</p>
        <ul className="mt-4 list-disc list-inside text-sm text-gray-700 space-y-1">
          {p.usp?.map((u,i)=>(<li key={i}>{u}</li>))}
        </ul>
        <form action={buy} className="mt-6">
          <button type="submit" className="rounded-xl bg-black text-white px-5 py-3 hover:bg-gray-800">
            Test-bestelling plaatsen
          </button>
        </form>
        <p className="mt-3 text-xs text-gray-500">Demo: geen echte betaling; order-ID wordt getoond.</p>
      </div>
    </div>
  );
}