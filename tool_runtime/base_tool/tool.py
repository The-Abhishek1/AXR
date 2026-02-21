class BaseTool:
    def execute(self, process, step, memory_manager=None):
        raise NotImplementedError

    def rollback(self, process, step,memory_manager=None):
        pass