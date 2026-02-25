from __future__ import annotations

from typing import List, Dict
from uuid import uuid4

from axr_core.process_graph.models import ProcessStep


def plan_to_steps(pid, plan: Dict) -> List[ProcessStep]:
    steps: List[ProcessStep] = []

    priority_map = {}

    for item in plan["steps"]:
        step = ProcessStep(
            pid=pid,
            syscall=item["tool"],
            cost_estimate=1.0,
        )

        step.priority = item.get("priority", 1)

        steps.append(step)

    # Build simple dependency chain by priority
    steps_sorted = sorted(steps, key=lambda s: s.priority)

    for i in range(1, len(steps_sorted)):
        if steps_sorted[i].priority > steps_sorted[i - 1].priority:
            steps_sorted[i].depends_on.append(steps_sorted[i - 1].step_id)

    return steps