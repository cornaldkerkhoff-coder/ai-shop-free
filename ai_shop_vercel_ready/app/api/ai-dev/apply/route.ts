import { NextResponse } from "next/server";
import { getOcto, REPO } from "@/lib/octo";

export const dynamic = "force-dynamic";

type Change = { path: string; newContent: string; reason?: string };

export async function POST(req: Request) {
  const { changes, title, body } = await req.json() as {
    changes: Change[]; title?: string; body?: string;
  };
  if (!changes?.length) return NextResponse.json({ error: "No changes" }, { status: 400 });

  const octo = getOcto();
  // 1) Base branch ophalen
  const repoInfo = await octo.repos.get(REPO);
  const base = repoInfo.data.default_branch ?? "main";
  const runId = Date.now().toString();
  const branch = `ai/console-${runId}`;

  // 2) commit per file met "createOrUpdateFileContents" API
  for (const c of changes) {
    const fullPath = REPO.basePath ? `${REPO.basePath}/${c.path}` : c.path;
    // SHA ophalen (als bestand al bestaat)
    let sha: string | undefined = undefined;
    try {
      const res = await octo.repos.getContent({ ...REPO, path: fullPath, ref: base });
      if (!Array.isArray(res.data) && "sha" in res.data) sha = (res.data as any).sha;
    } catch { /* nieuw bestand */ }

    await octo.repos.createOrUpdateFileContents({
      ...REPO,
      branch,            // schrijf op nieuwe branch
      path: fullPath,
      message: `chore(ai): ${c.reason || "update"} (${fullPath})`,
      content: Buffer.from(c.newContent, "utf8").toString("base64"),
      sha
    });
  }

  // 3) PR openen
  const pr = await octo.pulls.create({
    ...REPO,
    title: title || "AI Console: code update",
    head: branch,
    base,
    body: body || "Automatische wijziging via AI Dev Console."
  });

  return NextResponse.json({ ok: true, pr: pr.data.html_url });
}
