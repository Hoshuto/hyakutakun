"use client";

import { useState, useEffect, useCallback } from "react";
import type { Message } from "@/lib/api";

interface MessageBubbleProps {
  message: Message;
  avatar: string;
  characterName: string;
  isStreaming?: boolean;
}

export default function MessageBubble({
  message,
  avatar,
  characterName,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  // SpeechSynthesis の対応チェック
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setTtsSupported(true);
    }
  }, []);

  // コンポーネントのアンマウント時に再生を停止
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const toggleSpeech = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = "ja-JP";

    // 日本語の男性音声を優先的に選択
    const voices = window.speechSynthesis.getVoices();
    const jaVoices = voices.filter((v) => v.lang.startsWith("ja"));
    // macOS の男性音声（Otoya, Hattori）を優先
    const maleVoiceNames = ["Otoya", "Hattori"];
    const maleVoice = jaVoices.find((v) =>
      maleVoiceNames.some((name) => v.name.includes(name))
    );
    utterance.voice = maleVoice || jaVoices[0] || null;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking, message.content]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {/* アシスタントのアイコン */}
      {!isUser && (
        <div className="mr-2 flex-shrink-0">
          <img src={avatar} alt={characterName} className="h-8 w-8 rounded-full object-cover" />
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

      {/* アシスタントメッセージの読み上げボタン */}
      {!isUser && ttsSupported && message.content && !isStreaming && (
        <button
          onClick={toggleSpeech}
          className="ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center self-end rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label={isSpeaking ? "読み上げ停止" : "読み上げ"}
        >
          {isSpeaking ? (
            // 停止アイコン
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
            </svg>
          ) : (
            // スピーカーアイコン
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
            </svg>
          )}
        </button>
      )}

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
