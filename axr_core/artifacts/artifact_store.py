import os
import json
from uuid import UUID

from axr_core.artifacts.artifact_model import Artifact


ARTIFACT_ROOT = "axr_artifacts"


class ArtifactStore:

    def __init__(self):
        os.makedirs(ARTIFACT_ROOT, exist_ok=True)

    def save_artifact(self, pid: UUID, step_id: UUID, name: str, data):

        process_dir = os.path.join(ARTIFACT_ROOT, f"process_{pid}")
        os.makedirs(process_dir, exist_ok=True)

        file_path = os.path.join(process_dir, name)

        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)

        artifact = Artifact.create(pid, step_id, name, file_path)

        return artifact

    def load_artifact(self, artifact_path):

        with open(artifact_path, "r") as f:
            return json.load(f)