import os
from collections.abc import AsyncGenerator

from google import genai

from prompts import CHARACTERS

MODEL = "gemini-2.5-flash"

# Gemini API クライアント（遅延初期化）
_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
    return _client


async def stream_chat(messages: list[dict], character: str = "hyakutakun") -> AsyncGenerator[str, None]:
    """Gemini API にストリーミングリクエストを送信し、テキストチャンクを逐次返す"""
    # キャラクターのプロンプトを取得（不明なキャラはデフォルト）
    char_data = CHARACTERS.get(character, CHARACTERS["hyakutakun"])
    system_prompt = char_data["prompt"]

    client = _get_client()
    stream = await client.aio.models.generate_content_stream(
        model=MODEL,
        contents=messages,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
        ),
    )
    async for response in stream:
        if response.text:
            yield response.text
