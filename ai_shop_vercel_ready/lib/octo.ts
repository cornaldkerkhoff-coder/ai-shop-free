import { Octokit } from "octokit";

export function getOcto() {
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN missing");
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

export const REPO = {
  owner: process.env.REPO_OWNER!,
  repo: process.env.REPO_NAME!,
  basePath: process.env.REPO_BASE_PATH ?? "",
};
