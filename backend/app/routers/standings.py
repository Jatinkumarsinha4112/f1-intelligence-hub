from fastapi import APIRouter, HTTPException
from typing import Optional
from app.services.ergast_service import ergast

router = APIRouter(prefix="/standings", tags=["Standings"])

@router.get("/{season}/constructors")
async def get_constructor_standings(season: int, round: Optional[int] = None):
    try:
        standings = await ergast.get_constructor_standings(season, round)
        if not standings:
            raise HTTPException(status_code=404, detail="Standings not available")
        formatted = []
        for s in standings:
            con = s.get("Constructor", {})
            formatted.append({
                "position": int(s.get("position", 0)),
                "points": float(s.get("points", 0)),
                "wins": int(s.get("wins", 0)),
                "constructor_name": con.get("name", ""),
                "nationality": con.get("nationality", ""),
            })
        return {"season": season, "standings": formatted}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
