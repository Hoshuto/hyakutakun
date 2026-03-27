# CLAUDE.md

このファイルはリポジトリで作業する際の Claude Code (claude.ai/code) へのガイダンスを提供します。

---

## 言語設定

すべてのやり取りは**日本語**で行う。コードのコメント・コミットメッセージも日本語で記述する。

---

## 📐 概要

日本保守党代表・百田尚樹のAIチャットボット「AIひゃくた君」。
テキストチャットで百田尚樹風の応答をリアルタイムストリーミングで返す。

### Tech Stack

- **Frontend**: Next.js (静的エクスポート), TypeScript
- **Backend**: Python, FastAPI, google-genai SDK
- **LLM**: Google Gemini (`gemini-2.5-flash`)
- **Hosting**: Cloudflare Pages (FE) / ConoHa VPS + Docker (BE)

### Architecture

```
Cloudflare Pages (Next.js 静的エクスポート)
    ↓ POST /api/chat (SSE)
ConoHa VPS (FastAPI + google-genai SDK)
    → Gemini API でストリーミング応答
```

```
/hyakutakun
├── frontend/          # Next.js (静的エクスポート)
├── backend/
│   ├── main.py        # FastAPI エントリポイント
│   ├── chat.py        # Gemini API ストリーミング
│   ├── prompts.py     # システムプロンプト
│   └── models.py      # Pydantic モデル
└── CLAUDE.md
```

### Common Commands

```bash
make local              # FE + BE 同時起動
make frontend           # フロントエンドのみ起動 (port 9002)
make backend            # バックエンドのみ起動 (port 9001)
make build              # フロントエンドビルド
make deploy             # FE + BE デプロイ
```

### Slash Commands

| コマンド | 説明 |
|----------|------|
| `/web起動` | FE (port 9002) + BE (port 9001) を同時起動 |

### Ports

| サービス | ポート |
|---------|--------|
| Backend API | 9001 |
| Frontend | 9002 |

> `frontend/.env.local` に `NEXT_PUBLIC_API_URL=http://localhost:9001` を設定

### 本番デプロイ

| レイヤー | 環境 | 方法 |
|---|---|---|
| フロントエンド | Cloudflare Pages | Git push で自動ビルド・デプロイ |
| バックエンド | ConoHa VPS | `docker compose up --build -d`（nginx がリバースプロキシ） |

---

## 🚫 絶対禁止ルール

| 禁止事項 | 正しい対応 |
|---------|-----------|
| `yarn` コマンドの実行 | `npm` に置き換え |
| `next/image` の `<Image>` 使用 | `<img>` タグを直接使用（静的エクスポートの制約） |
| `getServerSideProps` / Route Handlers の使用 | 使用不可（`output: "export"` の制約） |
| ビルド失敗のまま「完了」と報告 | ビルド成功まで作業を続ける |

---

## ✅ 完了報告の条件

```bash
# フロントエンド変更時
cd frontend && npm run build   # エラーなし

# バックエンド変更時
cd backend && source .venv/bin/activate && python -c "from main import app"   # インポートエラーなし
```

**両方成功するまで「完了」と報告してはいけない。**

---

## ⚠️ アーキテクチャの重要ポイント

### 静的エクスポートの制約

`next.config.ts` に `output: "export"` があるため、`next/image`・サーバーサイド機能は使用不可。画像は `<img>` タグを直接使用する。

### ストリーミング

- バックエンド: FastAPI の `StreamingResponse` で SSE 形式のイベントを送信
- フロントエンド: `fetch` + `ReadableStream` で SSE を受信・逐次表示
- nginx: `proxy_buffering off` で SSE のバッファリングを無効化

---

## 🔑 APIキー管理

- Gemini APIキーは `backend/.env` の `GOOGLE_API_KEY` で管理
- 無料枠のクォータは**アカウント単位**で制限される（プロジェクト単位ではない）
- クォータ超過時は同一アカウントで新キーを発行しても解決しない → 課金有効化 or 別アカウントが必要
- `gemini-2.0-flash` は新規ユーザーに非対応。`gemini-2.5-flash` 以降を使用すること
- `.env` の変更後はバックエンドの再起動が必要（`--reload` では `.env` は自動反映されない）

---

**このファイルのルールは「推奨」ではなく「必須」。違反時は即座に停止してユーザーに報告。**
