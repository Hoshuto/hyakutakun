export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SSEEvent {
  type: "text" | "done" | "error";
  content?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * SSE ストリーミングでチャットAPIにリクエストを送信し、
 * テキストチャンクをコールバックで逐次返す
 */
export async function streamChat(
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    onError(`APIエラー: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError("ストリーミングに対応していません");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    // 最後の不完全な行はバッファに残す
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const event: SSEEvent = JSON.parse(jsonStr);
        switch (event.type) {
          case "text":
            if (event.content) onChunk(event.content);
            break;
          case "done":
            onDone();
            return;
          case "error":
            onError(event.content || "不明なエラー");
            return;
        }
      } catch {
        // JSON パースエラーは無視
      }
    }
  }

  onDone();
}
