import json
import os
import traceback

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from chat import stream_chat
from models import ChatRequest
from prompts import CHARACTERS

app = FastAPI(title="日本保守党 AIチャット API")

# CORS 設定
allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:9002"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/characters")
async def get_characters():
    """キャラクター一覧を返す"""
    return [
        {"id": char_id, "name": char["name"], "person": char["person"]}
        for char_id, char in CHARACTERS.items()
    ]


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """チャットエンドポイント（SSE ストリーミング）"""

    # メッセージを Gemini API 形式に変換（assistant → model）
    messages = [
        {"role": "model" if m.role == "assistant" else m.role, "parts": [{"text": m.content}]}
        for m in request.messages
    ]

    async def event_stream():
        try:
            async for chunk in stream_chat(messages, request.character):
                # SSE 形式でテキストチャンクを送信
                data = json.dumps({"type": "text", "content": chunk}, ensure_ascii=False)
                yield f"data: {data}\n\n"
            # 完了シグナル
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            traceback.print_exc()
            error_data = json.dumps(
                {"type": "error", "content": str(e)}, ensure_ascii=False
            )
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # nginx のバッファリング無効化
        },
    )
