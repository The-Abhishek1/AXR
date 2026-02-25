import json
from openai import OpenAI


class LLMClient:
    def __init__(self, client: OpenAI):
        self.client = client

    def complete(self, prompt: str) -> str:
        resp = self.client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            messages=[
                {"role": "system", "content": "You output only valid JSON."},
                {"role": "user", "content": prompt},
            ],
        )

        return resp.choices[0].message.content.strip()

    def generate_json(self, prompt: str):
        text = self.complete(prompt)
        return json.loads(text)