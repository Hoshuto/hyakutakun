import type { Message } from "@/lib/api";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {/* アシスタントのアイコン */}
      {!isUser && (
        <div className="mr-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white text-sm font-bold">
            百
          </div>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[var(--user-bubble)] text-[var(--user-text)] rounded-br-md"
            : "bg-[var(--assistant-bubble)] text-[var(--assistant-text)] rounded-bl-md shadow-sm border border-[var(--border)]"
        }`}
      >
        <p
          className={`whitespace-pre-wrap text-sm leading-relaxed ${
            isStreaming ? "streaming-cursor" : ""
          }`}
        >
          {message.content}
        </p>
      </div>

      {/* ユーザーのアイコン */}
      {isUser && (
        <div className="ml-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-white text-sm">
            👤
          </div>
        </div>
      )}
    </div>
  );
}
