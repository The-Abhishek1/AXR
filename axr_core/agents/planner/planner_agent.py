from __future__ import annotations

import json
from typing import Dict

from tool_registry.registry import ToolRegistry
from configs.mock import PLANNER_MODE


class PlannerAgent:
    """
    AI Planner Agent
    Converts user goal → structured execution plan
    """

    def __init__(self, llm_client, tool_registry: ToolRegistry):
        self.llm = llm_client
        self.tool_registry = tool_registry

    def _build_tool_context(self) -> str:
        tools = self.tool_registry.list_tools()

        tool_descriptions = "\n".join(
            f"{t.name}: {t.description}" for t in tools
        )

        return tool_descriptions

    def _mock_plan(self, goal: str) -> Dict:
        # simple static plan for kernel testing
        return {
            "steps": [
                {"tool": "git.clone", "priority": 1},
                {"tool": "sast.scan", "priority": 2},
                {"tool": "lint", "priority": 2},
                {"tool": "deploy.service", "priority": 3},
            ]
        }

    def create_plan(self, goal: str) -> Dict:
        if PLANNER_MODE == "mock":
            return self._mock_plan(goal)

        tool_context = self._build_tool_context()

        prompt = f"""
                    You are an AI planner for a distributed execution kernel.

                    Available tools:
                    {tool_context}

                    User goal:
                    {goal}

                    Return ONLY valid JSON in this format:
                    {{
                    "steps": [
                        {{"tool": "tool.name", "priority": 1}}
                    ]
                    }}

                    Rules:
                    - Use only available tools
                    - Respect logical order (clone before scan, scan before deploy)
                    - Parallelizable steps can share same priority
                    """

        response = self.llm.complete(prompt)

        try:
            plan = json.loads(response)
        except Exception:
            raise RuntimeError(f"Planner returned invalid JSON:\n{response}")

        return plan