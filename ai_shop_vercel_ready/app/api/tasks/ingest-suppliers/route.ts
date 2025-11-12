export const dynamic = "force-dynamic";

function calculateSalePrice({
  cost, shipping, feesPct, vatPct, marginTarget
}: { cost:number; shipping:number; feesPct:number; vatPct:number; marginTarget:number }) {
  const c = cost + shipping;
  const denom = (1 - feesPct) / (1 + vatPct) - marginTarget;
  if (denom <= 0) throw new Error("Margetarget te hoog.");
  const sale = c / denom;
  const rounded = Math.max(0, Math.round(sale) - 0.01);
  return Number(rounded.toFixed(2));
}

export async function GET() {
  // demo-“gevonden” items
  const supplierItems = [
    { id: "SKU-1", title: "USB-C Hub 7-in-1", cost: 14.5, shipping_eur: 2.5, stock: 12 },
    { id: "SKU-2", title: "Bluetooth Speaker 20W", cost: 16.0, shipping_eur: 2.95, stock: 8 },
  ];

  const feesPct = 0.13, vatPct = 0.21, marginTarget = 0.25;

  const items = supplierItems.map(i => ({
    id: i.id,
    title: i.title,
    costPrice: i.cost,
    shippingCost: i.shipping_eur,
    salePrice: calculateSalePrice({
      cost: i.cost, shipping: i.shipping_eur ?? 0, feesPct, vatPct, marginTarget
    }),
    stock: i.stock
  }));

  return Response.json({ ok: true, items });
}
