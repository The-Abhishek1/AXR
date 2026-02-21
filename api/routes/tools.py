from fastapi import APIRouter
from tool_registry.registry import ToolRegistry

router = APIRouter()


@router.get("/")
def list_tools():
    registry = ToolRegistry()
    return {"tools": registry.list_tools()}