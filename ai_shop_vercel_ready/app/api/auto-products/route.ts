export const dynamic = "force-dynamic";

/** simpele prijsformule + afronding op .99 */
function calc({ cost, shipping, feesPct, vatPct, marginTarget }: {
  cost:number; shipping:number; feesPct:number; vatPct:number; marginTarget:number
}) {
  const c = cost + shipping;
  const d = (1 - feesPct) / (1 + vatPct) - marginTarget;
  if (d <= 0) throw new Error("Te agressieve marge.");
  const sale = c / d;
  return Number((Math.max(0, Math.round(sale) - 0.01)).toFixed(2));
}

/** haal demo-producten op (geen key nodig) */
async function fetchSupplierProducts() {
  // DummyJSON "winkel": 12 producten, met titel, beschrijving, prijs, images, stock
  const res = await fetch("https://dummyjson.com/products?limit=12", { cache: "no-store" });
  const json = await res.json();
  return Array.isArray(json.products) ? json.products : [];
}

export async function GET() {
  // instellingen (pas gerust aan)
  const feesPct = 0.13;      // payment/marketplace + margebuffer
  const vatPct = 0.21;       // NL btw
  const marginTarget = 0.25; // gewenste marge

  const src = await fetchSupplierProducts();

  // DummyJSON heeft 'price' als consumentenprijs. We nemen een grove inkoop-schatting (65%)
  // zodat we een realistische verkoopprijs mét marge kunnen berekenen.
  const shippingFlat = 3.95;

  const items = src.map((p: any, idx: number) => {
    const cost = Number(p.price ?? 0) * 0.65; // schatting inkoop
    const shipping = shippingFlat;
    const price = calc({ cost, shipping, feesPct, vatPct, marginTarget });

    return {
      id: String(p.id ?? `demo-${idx}`),
      title: String(p.title ?? "Product"),
      description: String(p.description ?? ""),
      image: Array.isArray(p.images) && p.images.length ? p.images[0] : p.thumbnail ?? null,
      price,
      stock: Number(p.stock ?? 5),
      status: (p.stock ?? 5) > 0 ? "live" : "archived"
    };
  });

  return Response.json({ ok: true, items });
}
