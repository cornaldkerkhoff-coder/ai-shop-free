export const dynamic = "force-dynamic";

type P = { id:string; title:string; description:string; image:string|null; price:number; stock:number };

async function fetchProducts(): Promise<P[]> {
  // Probeer met Vercel hostnaam (server-side)
  const base = process.env.NEXT_PUBLIC_BASE_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  try {
    const r = await fetch(`${base}/api/auto-products`, { cache: "no-store" });
    if (r.ok) { const j = await r.json(); return j.items as P[]; }
  } catch {}
  // Fallback (werkt lokaal/relative)
  try {
    const r2 = await fetch("/api/auto-products" as any, { cache: "no-store" });
    if (r2.ok) { const j2 = await r2.json(); return j2.items as P[]; }
  } catch {}
  return [];
}

export default async function Home() {
  const products = await fetchProducts();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">AI Shop</h1>
        <p className="text-slate-500">Automatisch gevonden & geprijsd</p>
      </header>

      {products.length === 0 ? (
        <p className="text-slate-500">Geen producten (check SUPPLIER_FEED_URL of voorraad).</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(p => (
            <article key={p.id} className="rounded-2xl border p-4 shadow-sm">
              {p.image && <img src={p.image} alt={p.title} className="h-44 w-full object-cover rounded-xl mb-3" />}
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{p.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold">€ {p.price.toFixed(2)}</span>
                <a className="text-sm underline" href={`/product/${encodeURIComponent(p.id)}`}>Bekijk</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
