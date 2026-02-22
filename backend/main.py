import json
import os
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from chat import stream_chat
from models import ChatRequest

app = FastAPI(title="AIひゃくた君 API")

# CORS 設定
allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:3000"
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


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """チャットエンドポイント（SSE ストリーミング）"""

    # メッセージを Claude API 形式に変換
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    async def event_stream():
        try:
            async for chunk in stream_chat(messages):
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
