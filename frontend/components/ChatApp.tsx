"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Message } from "@/lib/api";
import { streamChat } from "@/lib/api";
import { getCharacter } from "@/lib/characters";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface ChatAppProps {
  characterId: string;
}

export default function ChatApp({ characterId }: ChatAppProps) {
  const character = getCharacter(characterId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      const userMessage: Message = { role: "user", content: text };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsStreaming(true);

      // アシスタントの空メッセージを追加（ストリーミングで埋める）
      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages([...newMessages, assistantMessage]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      await streamChat(
        newMessages,
        characterId,
        // onChunk: テキストを追記
        (chunk) => {
          assistantMessage.content += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMessage };
            return updated;
          });
        },
        // onDone
        () => {
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        // onError
        (error) => {
          console.error("チャットエラー:", error);
          assistantMessage.content =
            "申し訳ありません、エラーが発生しました。もう一度お試しください。";
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMessage };
            return updated;
          });
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        controller.signal
      );
    },
    [messages, isStreaming, characterId]
  );

  if (!character) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p>キャラクターが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* ヘッダー */}
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
            </svg>
          </Link>
          <img src={character.avatar} alt={character.name} className="h-10 w-10 rounded-full object-cover" />
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)]">
              {character.name}
            </h1>
            <p className="text-xs text-gray-500">
              {character.person}
            </p>
          </div>
        </div>
      </header>

      {/* チャットエリア */}
      <main className="flex-1 overflow-y-auto chat-scroll">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <img src={character.avatar} alt={character.name} className="mb-4 h-20 w-20 rounded-full object-cover" />
              <h2 className="mb-2 text-xl font-bold">{character.name}</h2>
              <p className="text-sm text-gray-500 max-w-sm">
                {character.description}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              avatar={character.avatar}
              characterName={character.name}
              isStreaming={
                isStreaming &&
                i === messages.length - 1 &&
                msg.role === "assistant"
              }
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* 入力エリア */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
