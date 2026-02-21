from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_policy():
    # later load from security module
    return {"policy": "devsecops_safe.yaml"}