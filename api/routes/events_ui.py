from fastapi import APIRouter

router = APIRouter()


@router.get("/events/ui")
def list_events_ui():
    return {
        "message": "Event UI not connected to persistence yet"
    }