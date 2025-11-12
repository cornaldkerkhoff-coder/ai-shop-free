import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products";

// Demo: geen database. Order-ID wordt gegenereerd en alleen teruggegeven (niet persistent).
export async function POST(req: Request){
  const { id } = await req.json();
  const p = getProductById(id);
  if (!p) return NextResponse.json({ ok:false, error:"Product not found" }, { status: 404 });
  const orderId = Math.random().toString(36).slice(2,10);
  return NextResponse.json({ ok:true, orderId });
}