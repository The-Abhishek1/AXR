# api/routes/policies.py
from fastapi import APIRouter

router = APIRouter(tags=["policies"])

@router.get("/policies")
def get_policy():
    """Get the current security policy"""
    # later load from security module
    return {"policy": "devsecops_safe.yaml"}