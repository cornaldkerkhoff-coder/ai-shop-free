import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// We vragen het model om EENVOUDIG JSON terug te geven: plan + mogelijke settings/vragen
const SYSTEM = `Je bent een strikte code-editor voor een Next.js (App Router) project.
- Output ALLEEN valide JSON, geen tekst er omheen.
- Geef een plan (array "changes"): elk element { "path": "app/..", "reason": "korte uitleg", "newContent": "VOLLEDIGE nieuwe bestandsinhoud" }.
- Zet geen backticks in newContent.
- Voeg "settings" toe als [{ "key": "...", "suggestedValue": "...", "why": "..."}] wanneer env vars of vercel-config nodig is.
- Voeg "questions" toe als [{ "q": "vraag aan gebruiker"}] wanneer je info mist.
- Bewerk alleen binnen ${process.env.REPO_BASE_PATH ?? "(project root)"}.
`;

type Plan = {
  changes: { path: string; reason: string; newContent: string }[];
  settings?: { key: string; suggestedValue?: string; why: string }[];
  questions?: { q: string }[];
};

export async function POST(req: Request) {
  const { prompt } = await req.json();
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });

  const body = {
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Gebruikersopdracht:\n${prompt}\n` }
    ],
    response_format: { type: "json_object" as const }
  };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const j = await r.json();

  let plan: Plan;
  try { plan = JSON.parse(j.choices?.[0]?.message?.content ?? "{}"); }
  catch { return NextResponse.json({ error: "Model returned non-JSON" }, { status: 500 }); }

  // Minimal sanity check
  if (!Array.isArray(plan?.changes)) plan = { changes: [] };

  return NextResponse.json({ ok: true, plan });
}
