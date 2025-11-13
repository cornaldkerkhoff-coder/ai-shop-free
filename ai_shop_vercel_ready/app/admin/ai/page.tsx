"use client";
import { useState } from "react";

type Plan = {
  changes: { path: string; reason: string; newContent: string }[];
  settings?: { key: string; suggestedValue?: string; why: string }[];
  questions?: { q: string }[];
};

export default function AIDevConsole() {
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string>("");

  async function makePlan() {
    setBusy(true); setPrUrl(null); setLog("");
    const r = await fetch("/api/ai-dev/plan", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const j = await r.json();
    setBusy(false);
    if (!j.ok) { setLog(j.error || "Fout bij plan"); return; }
    setPlan(j.plan);
  }

  async function applyPlan() {
    if (!plan || !plan.changes.length) return;
    setBusy(true); setLog("Wijzigingen doorvoeren…");
    const r = await fetch("/api/ai-dev/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        changes: plan.changes,
        title: "AI Console: code update",
        body: "Genereerd via de ingebouwde AI Dev Console."
      })
    });
    const j = await r.json();
    setBusy(false);
    if (!j.ok) { setLog(j.error || "Fout bij apply"); return; }
    setPrUrl(j.pr);
    setLog("PR aangemaakt ✅");
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI Dev Console</h1>
      <p className="text-sm text-slate-600">
        Beschrijf wat je wil. Voorbeeld: “Verhoog marge naar 30% in /api/auto-products, voeg badge ‘AUTOPRICER ON’ toe op de home”.
      </p>

      <textarea
        value={prompt}
        onChange={e=>setPrompt(e.target.value)}
        placeholder="Typ hier je opdracht…"
        className="w-full h-32 rounded-xl border p-3"
      />

      <div className="flex gap-3">
        <button onClick={makePlan} disabled={busy} className="rounded-xl border px-4 py-2 shadow-sm">
          {busy ? "Bezig…" : "Maak plan"}
        </button>
        <button onClick={applyPlan} disabled={!plan || !plan.changes.length || busy}
          className="rounded-xl border px-4 py-2 shadow-sm">
          Plan toepassen → PR
        </button>
        {prUrl && <a className="underline" href={prUrl} target="_blank">Open PR</a>}
      </div>

      {plan && (
        <section className="space-y-4">
          <h2 className="font-semibold">Voorstel</h2>
          {plan.questions?.length ? (
            <div className="rounded-lg border p-3">
              <h3 className="font-medium mb-2">Vragen</h3>
              <ul className="list-disc ml-5">{plan.questions.map((q,i)=><li key={i}>{q.q}</li>)}</ul>
            </div>
          ) : null}

          {plan.settings?.length ? (
            <div className="rounded-lg border p-3">
              <h3 className="font-medium mb-2">Instellingen die je moet zetten</h3>
              <ul className="list-disc ml-5">
                {plan.settings.map((s,i)=><li key={i}><code>{s.key}</code>{s.suggestedValue ? ` = ${s.suggestedValue}`:""} — {s.why}</li>)}
              </ul>
            </div>
          ) : null}

          <div className="rounded-lg border p-3">
            <h3 className="font-medium mb-2">Bestandswijzigingen</h3>
            {!plan.changes.length && <p>Geen wijzigingen.</p>}
            {plan.changes.map((c,i)=>(
              <details key={i} className="mb-3">
                <summary className="cursor-pointer">{c.path} — {c.reason}</summary>
                <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs">{c.newContent}</pre>
              </details>
            ))}
          </div>
        </section>
      )}

      {!!log && <p className="text-sm text-slate-600">{log}</p>}
    </main>
  );
}
