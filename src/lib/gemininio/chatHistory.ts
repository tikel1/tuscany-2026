/** Completed turns only — safe to send to Gemini REST `contents` or to embed in Live system text. */
export type ChatTurn = { role: "user" | "model"; text: string };

export function completedTurnsForApi(
  messages: Array<{ role: "user" | "model"; text: string; streaming?: boolean }>
): ChatTurn[] {
  return messages
    .filter(
      m =>
        (m.role === "user" || m.role === "model") &&
        m.text.trim().length > 0 &&
        !m.streaming
    )
    .map(m => ({ role: m.role, text: m.text.trim() }));
}

/**
 * Compact transcript for system-instruction injection (Live reconnect).
 * Keeps tail only so the trip digest + this block stay within limits.
 */
export function formatRecentChatBlock(turns: ChatTurn[], maxChars = 6000): string {
  let slice = turns.length > 20 ? turns.slice(-20) : turns;
  const lines = slice.map(
    m => `${m.role === "user" ? "User" : "Gemininio"}: ${m.text}`
  );
  let text = lines.join("\n");
  if (text.length > maxChars) {
    text = "…(earlier turns omitted)\n" + text.slice(text.length - maxChars + 28);
  }
  return text;
}
