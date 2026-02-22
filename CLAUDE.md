# CLAUDE.md

このファイルはリポジトリで作業する際の Claude Code (claude.ai/code) へのガイダンスを提供します。

---

## 言語設定

すべてのやり取りは**日本語**で行う。コードのコメント・コミットメッセージも日本語で記述する。

---

## 📐 概要

日本保守党代表・百田尚樹のAIチャットボット「AIひゃくた君」。
テキストチャットで百田尚樹風の応答をリアルタイムストリーミングで返す。

```
Cloudflare Pages (Next.js 静的エクスポート)
    ↓ POST /api/chat (SSE)
ConoHa VPS (FastAPI + anthropic SDK)
    → Claude API でストリーミング応答
```

### 開発環境の起動

```bash
# バックエンド
cd backend
source .venv/bin/activate   # または python3 -m venv .venv && pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
uvicorn main:app --reload --port 8001   # http://localhost:8001

# フロントエンド
cd frontend
npm run dev   # http://localhost:3000
# frontend/.env.local に NEXT_PUBLIC_API_URL=http://localhost:8001 が必要
```

### 本番デプロイ

| レイヤー | 環境 | 方法 |
|---|---|---|
| フロントエンド | Cloudflare Pages | Git push で自動ビルド・デプロイ |
| バックエンド | ConoHa VPS | `docker compose up --build -d`（nginx が `127.0.0.1:8001` にリバースプロキシ） |

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

### ポート

- candidateプロジェクト: 8000
- hyakutakun（本プロジェクト）: 8001

---

**このファイルのルールは「推奨」ではなく「必須」。違反時は即座に停止してユーザーに報告。**
