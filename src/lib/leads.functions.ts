import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
});

const REPO_OWNER = "JustinBieber2548";
const REPO_NAME = "PK-cahtbot-website";
const FILE_PATH = "data/leads.txt";
const BRANCH = "main";

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN not configured");

    const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "pk-chatbot",
    };

    // Get current file (if exists)
    let currentContent = "";
    let sha: string | undefined;
    const getRes = await fetch(`${apiBase}?ref=${BRANCH}`, { headers });
    if (getRes.ok) {
      const json = (await getRes.json()) as { content: string; sha: string; encoding: string };
      sha = json.sha;
      currentContent = atob(json.content.replace(/\n/g, ""));
    } else if (getRes.status !== 404) {
      throw new Error(`GitHub read failed: ${getRes.status} ${await getRes.text()}`);
    }

    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${data.name} <${data.email}> :: ${data.message.replace(/\n/g, " ")}\n`;
    const newContent = currentContent + entry;
    const encoded = btoa(unescape(encodeURIComponent(newContent)));

    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chat: new lead from ${data.name}`,
        content: encoded,
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!putRes.ok) {
      throw new Error(`GitHub write failed: ${putRes.status} ${await putRes.text()}`);
    }

    return { ok: true };
  });
