import os
import importlib
import inspect

from axr_core.agents.base.agent import BaseAgent


class DynamicAgentLoader:

    def __init__(self, registry):
        self.registry = registry

    def load_agents(self):

        base_dir = os.path.dirname(os.path.dirname(__file__))
        domains_path = os.path.join(base_dir, "domains")

        for root, _, files in os.walk(domains_path):

            for file in files:

                if not file.endswith(".py") or file.startswith("__"):
                    continue

                file_path = os.path.join(root, file)

                module_path = self._build_module_path(file_path)

                module = importlib.import_module(module_path)

                for _, obj in inspect.getmembers(module, inspect.isclass):

                    if issubclass(obj, BaseAgent) and obj != BaseAgent:

                        agent = obj()

                        self.registry.register(agent)

                        print(f"[AXR] Registered agent: {agent.name}")

    def _build_module_path(self, file_path):

        # convert filesystem path to module path
        rel_path = file_path.split("axr_core/")[-1]

        module_path = rel_path.replace("/", ".").replace(".py", "")

        return f"axr_core.{module_path}"