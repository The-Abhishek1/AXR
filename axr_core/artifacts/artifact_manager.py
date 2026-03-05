from axr_core.artifacts.artifact_store import ArtifactStore


class ArtifactManager:

    def __init__(self):
        self.store = ArtifactStore()

    def handle_step_output(self, pid, step_id, output):

        artifacts = []

        if isinstance(output, dict):

            for key, value in output.items():

                if key.endswith("_file") or key.endswith("_report"):

                    artifact = self.store.save_artifact(
                        pid,
                        step_id,
                        f"{key}.json",
                        value,
                    )

                    artifacts.append(artifact)

        return artifacts


artifact_manager = ArtifactManager()