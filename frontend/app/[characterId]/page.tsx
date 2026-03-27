import { CHARACTERS } from "@/lib/characters";
import ChatApp from "@/components/ChatApp";

// 静的エクスポート用: 3キャラ分のページを事前生成
export function generateStaticParams() {
  return CHARACTERS.map((char) => ({
    characterId: char.id,
  }));
}

export default async function CharacterChatPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = await params;
  return <ChatApp characterId={characterId} />;
}
