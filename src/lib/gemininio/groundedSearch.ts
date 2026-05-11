/**
 * One-shot Gemini `generateContent` with Google Search grounding.
 * Used for every typed chat turn; the model decides when a search
 * actually runs. Voice stays on the Live WebSocket (see live.ts).
 *
 * Docs: https://ai.google.dev/gemini-api/docs/google-search
 */

const MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.0-flash"] as const;

function extractTextFromCandidate(candidate: unknown): string {
  if (!candidate || typeof candidate !== "object") return "";
  const c = candidate as { content?: { parts?: unknown[] } };
  const parts = c.content?.parts;
  if (!Array.isArray(parts)) return "";
  const chunks: string[] = [];
  for (const p of parts) {
    if (!p || typeof p !== "object") continue;
    if ((p as { thought?: boolean }).thought === true) continue;
    const text = (p as { text?: string }).text;
    if (typeof text === "string" && text.length) chunks.push(text);
  }
  return chunks.join("\n").trim();
}

export interface GroundedReplyParams {
  apiKey: string;
  systemInstruction: string;
  userMessage: string;
  signal?: AbortSignal;
}

/**
 * Returns the model's plain-text reply. Search metadata is ignored
 * for v1 — we keep the bubble simple; sources can be added later.
 */
export async function generateGroundedReply(params: GroundedReplyParams): Promise<string> {
  let lastErr = "No model accepted the request.";

  for (const model of MODELS_TO_TRY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(params.apiKey)}`;
    const body = {
      systemInstruction: { parts: [{ text: params.systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: params.userMessage }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 1200
      }
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: params.signal
      });
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      continue;
    }

    const raw = await res.text();
    if (!res.ok) {
      lastErr = raw.slice(0, 400) || `HTTP ${res.status}`;
      continue;
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      lastErr = "Invalid JSON from Gemini.";
      continue;
    }

    const root = json as {
      candidates?: unknown[];
      error?: { message?: string };
    };
    if (root.error?.message) {
      lastErr = root.error.message;
      continue;
    }

    const candidate = root.candidates?.[0];
    const text = extractTextFromCandidate(candidate);
    if (text) return text;

    const block = candidate as { finishReason?: string } | undefined;
    lastErr = block?.finishReason
      ? `Model stopped (${block.finishReason}). Try rephrasing.`
      : "Empty reply from model.";
  }

  throw new Error(lastErr);
}
