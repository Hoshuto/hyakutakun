"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Message } from "@/lib/api";
import { streamChat } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function ChatApp() {
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
            "すまんな、ちょっとエラーが起きてしもた。もう一回試してくれへんか？";
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
    [messages, isStreaming]
  );

  return (
    <div className="flex h-dvh flex-col">
      {/* ヘッダー */}
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <img src="/hyakutakun3.jpeg" alt="AIひゃくた君" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)]">
              AIひゃくた君
            </h1>
            <p className="text-xs text-gray-500">
              日本保守党AIチャットボット
            </p>
          </div>
        </div>
      </header>

      {/* チャットエリア */}
      <main className="flex-1 overflow-y-auto chat-scroll">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <img src="/hyakutakun3.jpeg" alt="AIひゃくた君" className="mb-4 h-20 w-20 rounded-full object-cover" />
              <h2 className="mb-2 text-xl font-bold">AIひゃくた君</h2>
              <p className="text-sm text-gray-500 max-w-sm">
                おう、AIひゃくた君やで！なんでも聞いてや。
                政治のこと、日本のこと、僕の本のこと...遠慮はいらんで！
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
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
