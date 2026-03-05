from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Artifact:

    artifact_id: UUID
    pid: UUID
    step_id: UUID
    name: str
    path: str
    created_at: datetime

    @staticmethod
    def create(pid, step_id, name, path):
        return Artifact(
            artifact_id=uuid4(),
            pid=pid,
            step_id=step_id,
            name=name,
            path=path,
            created_at=datetime.utcnow(),
        )