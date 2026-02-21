class BaseTool:
    def execute(self, process, step):
        raise NotImplementedError

    def rollback(self, process, step):
        pass