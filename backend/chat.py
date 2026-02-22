import os
from collections.abc import AsyncGenerator

import anthropic

from prompts import SYSTEM_PROMPT

# Claude API クライアント（環境変数 ANTHROPIC_API_KEY を使用）
client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1024


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    """Claude API にストリーミングリクエストを送信し、テキストチャンクを逐次返す"""
    async with client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text
