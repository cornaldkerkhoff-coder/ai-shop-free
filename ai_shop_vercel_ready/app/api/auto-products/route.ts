export const dynamic = "force-dynamic";

function calc({ cost, shipping, feesPct, vatPct, marginTarget }:{
  cost:number; shipping:number; feesPct:number; vatPct:number; marginTarget:number
}) {
  const c = cost + shipping;
  const d = (1 - feesPct) / (1 + vatPct) - marginTarget;
  if (d <= 0) throw new Error("Te agressieve marge.");
  const sale = c / d;
  return Number((Math.max(0, Math.round(sale) - 0.01)).toFixed(2));
}

async function getFx(){
  const r = await fetch("https://api.exchangerate.host/latest?base=EUR",{ cache:"no-store" });
  const j = await r.json();
  return (j?.rates ?? {}) as Record<string, number>;
}

function toArray(x:any): any[] {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object") {
    if (Array.isArray(x.items)) return x.items;
    if (Array.isArray(x.products)) return x.products;
    if (Array.isArray(x.data)) return x.data;
    // soms komt het als object met id-keys { "SKU1": {...}, "SKU2": {...} }
    return Object.values(x);
  }
  return [];
}

export async function GET() {
  const feed = process.env.SUPPLIER_FEED_URL;
  if (!feed) return Response.json({ ok:false, error:"SUPPLIER_FEED_URL missing" }, { status:500 });

  let raw: any;
  try {
    const res = await fetch(feed, { cache:"no-store" });
    raw = await res.json();
  } catch (e:any) {
    return Response.json({ ok:false, error:"Feed niet bereikbaar", detail:String(e) }, { status:502 });
  }

  const list = toArray(raw);
  const fx = await getFx();
  const feesPct = 0.13, vatPct = 0.21, marginTarget = 0.25;

  const items = list.map((r:any, idx:number) => {
    const currency = String(r.currency ?? r.curr ?? "EUR").toUpperCase();
    const rate = currency === "EUR" ? 1 : (fx[currency] ?? 1);

    const cost = Number(
      r.cost ?? r.cost_eur ?? r.price ?? r.net ?? r.netto ?? 0
    ) * rate;

    const shipping = Number(
      r.shipping_eur ?? r.shipping?.eur ?? r.shipping ?? r.ship ?? 0
    );

    const title = String(r.title ?? r.name ?? `Product ${idx+1}`);
    const description = String(r.description ?? r.desc ?? "");
    const image = r.image_url ?? r.image ?? r.img ?? null;

    const price = calc({ cost, shipping, feesPct, vatPct, marginTarget });

    // als stock ontbreekt of 0 → default 5 zodat je iets ziet
    const stockRaw = r.stock ?? r.qty ?? r.quantity ?? r.inventory;
    const stock = Number(stockRaw ?? 5);

    return {
      id: String(r.id ?? r.sku ?? `${idx}`),
      title, description, image,
      price, stock
    };
  });

  return Response.json({ ok:true, items });
}
