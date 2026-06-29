from fastapi import APIRouter, HTTPException
from app.services.ergast_service import ergast

router = APIRouter(prefix="/seasons", tags=["Seasons"])

@router.get("")
async def get_seasons():
    try:
        seasons = await ergast.get_seasons()
        return {"total": len(seasons), "seasons": seasons}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/{season}/circuits")
async def get_circuits(season: int):
    try:
        circuits = await ergast.get_circuits(season)
        formatted = []

        for c in circuits:
            loc = c.get("Location", {})

            formatted.append({
                "circuit_id": c.get("circuitId", ""),
                "circuit_name": c.get("circuitName", ""),
                "country": loc.get("country", ""),
                "locality": loc.get("locality", ""),
                "lat": float(loc["lat"]) if loc.get("lat") else None,
                "lng": float(loc["long"]) if loc.get("long") else None,
            })

        return {
            "season": season,
            "total": len(formatted),
            "circuits": formatted
        }

    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
