from tool_runtime.base_tool.tool import BaseTool

class DockerBuildTool(BaseTool):

    name = "Docker Builder"
    syscall = "docker.build"
    description = "Build docker image"

    def execute(self, process, step, memory_manager=None):

        return {"image": "demo:latest"}

    def rollback(self, process, step, memory_manager=None):

        pass