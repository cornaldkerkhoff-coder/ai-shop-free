export const dynamic = "force-dynamic";

function calc({
  cost, shipping, feesPct, vatPct, marginTarget
}: { cost:number; shipping:number; feesPct:number; vatPct:number; marginTarget:number }) {
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

export async function GET() {
  const feed = process.env.SUPPLIER_FEED_URL;
  if (!feed) return Response.json({ ok:false, error:"SUPPLIER_FEED_URL missing" }, { status:500 });

  let raw: any[] = [];
  try {
    const res = await fetch(feed, { cache:"no-store" });
    raw = await res.json();
  } catch (e:any) {
    return Response.json({ ok:false, error:"Feed niet bereikbaar", detail:String(e) }, { status:502 });
  }

  const fx = await getFx();
  const feesPct = 0.13, vatPct = 0.21, marginTarget = 0.25;

  const items = raw.map((r, idx) => {
    // Tolerante mapping: accepteer meerdere veldnamen/vormen
    const currency = String(r.currency ?? "EUR").toUpperCase();
    const cost =
      Number(r.cost ?? r.cost_eur ?? r.price ?? r.netto ?? 0);            // prijs/inkoop
    const shipping =
      Number(r.shipping_eur ?? r.shipping?.eur ?? r.shipping ?? 0);        // 2.95 of { eur: 2.95 }
    const title =
      String(r.title ?? r.name ?? `Product ${idx+1}`);
    const description = String(r.description ?? r.desc ?? "");
    const image = r.image_url ?? r.image ?? r.img ?? null;
    const stock = Number(r.stock ?? r.qty ?? r.quantity ?? 0);

    const rate = currency === "EUR" ? 1 : (fx[currency] ?? 1);

    const price = calc({
      cost: cost * rate,
      shipping,
      feesPct, vatPct, marginTarget
    });

    return {
      id: String(r.id ?? r.sku ?? `${idx}`),
      title, description, image,
      price, stock,
      status: stock > 0 ? "live" : "archived"
    };
  }).filter(p => p.status === "live");

  return Response.json({ ok:true, items });
}
