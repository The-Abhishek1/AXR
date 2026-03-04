# axr_core/agents/llm_client.py
import json
import requests
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self, model: str = "Qwen2.5:3B", base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url
        self.timeout = 200

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate a response from Ollama"""
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,  # Low temperature for consistent output
                "top_p": 0.9,
                "top_k": 40,
                "num_predict": 2000,
            }
        }
        
        if system_prompt:
            payload["system"] = system_prompt

        try:
            logger.info(f"Sending request to Ollama with model: {self.model}")
            response = requests.post(url, json=payload, timeout=self.timeout)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Ollama: {e}")
            raise

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """Generate and parse JSON response"""
        response = self.generate(prompt, system_prompt)
        
        # Try to extract JSON from response
        try:
            # Look for JSON between triple backticks
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                # Try to find JSON object in the text
                start = response.find('{')
                end = response.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = response[start:end]
                else:
                    json_str = response.strip()
            
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from response: {response}")
            raise ValueError(f"Invalid JSON response: {e}")