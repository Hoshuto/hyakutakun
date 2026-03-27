import Link from "next/link";
import { CHARACTERS } from "@/lib/characters";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)]">
      {/* ヘッダー */}
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 text-center">
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            日本保守党 AIチャット
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            話したいキャラクターを選んでください
          </p>
        </div>
      </header>

      {/* キャラクター選択 */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {CHARACTERS.map((char) => (
            <Link
              key={char.id}
              href={`/${char.id}/`}
              className="group flex flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              <img
                src={char.avatar}
                alt={char.person}
                className="mb-4 h-24 w-24 rounded-full object-cover border-4 transition-colors"
                style={{ borderColor: char.color }}
              />
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {char.name}
              </h2>
              <p className="mt-1 text-center text-xs text-gray-500 leading-relaxed">
                {char.description}
              </p>
              <span
                className="mt-4 rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity group-hover:opacity-90"
                style={{ backgroundColor: char.color }}
              >
                話してみる
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
