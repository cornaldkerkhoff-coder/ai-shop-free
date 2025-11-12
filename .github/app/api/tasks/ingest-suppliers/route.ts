app/api/tasks/ingest-suppliers/route.ts
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, message: "Route werkt ✅" });
}
