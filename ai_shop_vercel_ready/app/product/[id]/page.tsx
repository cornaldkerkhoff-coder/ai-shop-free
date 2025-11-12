type P = { id:string; title:string; description:string; image:string|null; price:number; stock:number };

async function getProduct(id: string): Promise<P | null> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const url = `${base}/api/auto-products`;
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const all = (await r.json()).items as P[];
    return all.find(p => String(p.id) === id) ?? null;
  } catch { return null; }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return <main className="p-6">Product niet gevonden.</main>;
  return (
    <main className="mx-auto max-w-4xl p-6 grid md:grid-cols-2 gap-6">
      {product.image && (
        <img src={product.image} alt={product.title} className="w-full rounded-2xl object-cover" />
      )}
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
        <p className="text-slate-600 mb-4">{product.description}</p>
        <div className="text-xl font-bold mb-4">€ {product.price.toFixed(2)}</div>
        <button className="rounded-xl border px-4 py-2 shadow-sm">
          In winkelmand (demo)
        </button>
      </div>
    </main>
  );
}
