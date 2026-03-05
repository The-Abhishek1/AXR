import os
import importlib
import inspect

from axr_core.agents.base.agent import BaseAgent
from axr_core.agents.registry.agent_registry import AgentRegistry


class DynamicAgentLoader:

    def __init__(self, registry: AgentRegistry):
        self.registry = registry

    def load_agents(self):

        # absolute path to domains folder
        base_dir = os.path.dirname(os.path.dirname(__file__))
        domains_path = os.path.join(base_dir, "domains")

        for root, _, files in os.walk(domains_path):

            for file in files:

                if not file.endswith(".py") or file.startswith("__"):
                    continue

                file_path = os.path.join(root, file)

                module_path = self._to_module_path(file_path)

                module = importlib.import_module(module_path)

                for _, obj in inspect.getmembers(module):

                    if (
                        inspect.isclass(obj)
                        and issubclass(obj, BaseAgent)
                        and obj is not BaseAgent
                    ):

                        agent_instance = obj()
                        self.registry.register(agent_instance)

                        print(f"[AXR] Registered agent: {agent_instance.name}")

    def _to_module_path(self, file_path: str):

        # Convert filesystem path to module path
        project_root = os.getcwd()

        relative_path = os.path.relpath(file_path, project_root)

        module_path = relative_path.replace("/", ".").replace(".py", "")

        return module_path