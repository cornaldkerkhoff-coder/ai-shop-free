export const dynamic = "force-dynamic";

function calc({cost, shipping, feesPct, vatPct, marginTarget}:{cost:number;shipping:number;feesPct:number;vatPct:number;marginTarget:number;}){
  const c = cost + shipping;
  const d = (1 - feesPct) / (1 + vatPct) - marginTarget;
  if (d <= 0) throw new Error("Te agressieve marge.");
  const sale = c / d;
  return Number((Math.max(0, Math.round(sale) - 0.01)).toFixed(2));
}

async function getFx(){
  const r = await fetch("https://api.exchangerate.host/latest?base=EUR",{cache:"no-store"});
  const j = await r.json(); return j.rates as Record<string,number>;
}

export async function GET() {
  const feed = process.env.SUPPLIER_FEED_URL;
  if (!feed) return Response.json({ ok:false, error:"SUPPLIER_FEED_URL missing" }, { status:500 });

  const [items, fx] = await Promise.all([
    fetch(feed, { cache:"no-store" }).then(r=>r.json()),
    getFx()
  ]);

  const feesPct = 0.13, vatPct = 0.21, marginTarget = 0.25;

  const mapped = (items as any[]).map(r=>{
    const rate = r.currency === "EUR" ? 1 : (fx[r.currency] ?? 1);
    return {
      id: String(r.id),
      title: String(r.title ?? "Product"),
      description: String(r.description ?? ""),
      image: r.image_url ?? null,
      price: calc({ cost:Number(r.cost)*rate, shipping:Number(r.shipping_eur ?? 0), feesPct, vatPct, marginTarget }),
      stock: Number(r.stock ?? 0),
      status: (r.stock ?? 0) > 0 ? "live" : "archived"
    };
  }).filter(p=>p.status==="live");

  return Response.json({ ok:true, items:mapped });
}
