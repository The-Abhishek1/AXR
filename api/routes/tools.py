# api/routes/tools.py
from fastapi import APIRouter
from tool_registry.registry import ToolRegistry

router = APIRouter(tags=["tools"])

@router.get("/tools")
def list_tools():
    """List all available tools"""
    registry = ToolRegistry()
    return {"tools": registry.list_tools()}