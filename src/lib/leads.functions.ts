import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

const LeadImageSchema = z.object({
  name: z.string().min(1).max(160),
  type: z.enum(IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_IMAGE_BYTES),
  dataUrl: z.string().min(1),
});

const LeadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
  language: z.enum(["th", "en"]).default("th"),
  image: LeadImageSchema.optional(),
});

const REPO_OWNER = "JustinBieber2548";
const REPO_NAME = "PK-cahtbot-website";
const FILE_PATH = "data/leads.txt";
const IMAGE_DIR = "data/lead-images";
const BRANCH = "main";

type GitHubFile = {
  content: string;
  sha: string;
  encoding: string;
};

type ParsedImage = {
  path: string;
  contentBase64: string;
  byteSize: number;
};

function encodeUtf8ToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeUtf8FromBase64(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function getBase64ByteSize(value: string) {
  const padding = value.match(/=+$/)?.[0].length ?? 0;
  return Math.floor((value.length * 3) / 4) - padding;
}

function slugifyFileName(value: string) {
  return value
    .replace(/[^a-z0-9._-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function parseLeadImage(image: z.infer<typeof LeadImageSchema>, timestamp: string): ParsedImage {
  const match = image.dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[1] !== image.type) {
    throw new Error("Invalid image data");
  }

  const contentBase64 = match[2];
  const byteSize = getBase64ByteSize(contentBase64);
  if (!byteSize || byteSize > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large");
  }

  const extension = image.type.split("/")[1].replace("jpeg", "jpg");
  const safeName = slugifyFileName(image.name) || `lead-image.${extension}`;
  const filename = safeName.includes(".") ? safeName : `${safeName}.${extension}`;
  const timestampSlug = timestamp.replace(/[:.]/g, "-");

  return {
    path: `${IMAGE_DIR}/${timestampSlug}-${filename}`,
    contentBase64,
    byteSize,
  };
}

function getGitHubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "pk-chatbot",
  };
}

async function readTextFile(apiBase: string, headers: Record<string, string>) {
  const getRes = await fetch(`${apiBase}?ref=${BRANCH}`, { headers });
  if (getRes.status === 404) return { content: "", sha: undefined };
  if (!getRes.ok) {
    throw new Error(`GitHub read failed: ${getRes.status} ${await getRes.text()}`);
  }

  const json = (await getRes.json()) as GitHubFile;
  return {
    content: decodeUtf8FromBase64(json.content.replace(/\n/g, "")),
    sha: json.sha,
  };
}

async function putGitHubFile({
  apiBase,
  headers,
  message,
  content,
  sha,
}: {
  apiBase: string;
  headers: Record<string, string>;
  message: string;
  content: string;
  sha?: string;
}) {
  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    throw new Error(`GitHub write failed: ${putRes.status} ${await putRes.text()}`);
  }
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN not configured");

    const headers = getGitHubHeaders(token);
    const contentsBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;
    const leadApiBase = `${contentsBase}/${FILE_PATH}`;
    const timestamp = new Date().toISOString();

    let imagePath = "";
    if (data.image) {
      const image = parseLeadImage(data.image, timestamp);
      imagePath = image.path;
      await putGitHubFile({
        apiBase: `${contentsBase}/${image.path}`,
        headers,
        message: `chat: lead image from ${data.name}`,
        content: image.contentBase64,
      });
    }

    const { content: currentContent, sha } = await readTextFile(leadApiBase, headers);
    const compactMessage = data.message.replace(/\s+/g, " ").trim();
    const entry = [
      `[${timestamp}] ${data.name} <${data.email}>`,
      `language=${data.language}`,
      `message=${compactMessage}`,
      `image=${imagePath || "none"}`,
      "#ATP",
    ].join(" :: ");

    await putGitHubFile({
      apiBase: leadApiBase,
      headers,
      message: `chat: new lead from ${data.name}`,
      content: encodeUtf8ToBase64(`${currentContent}${entry}\n`),
      sha,
    });

    return { ok: true, imagePath };
  });
