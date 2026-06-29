from fastapi import APIRouter, HTTPException
from app.services.ergast_service import ergast

router = APIRouter(prefix="/history", tags=["History"])

_champions_cache = None
_driver_history_cache = {}

START_YEAR = 2015
END_YEAR = 2025


def _build_champion_entry(season: int, standing: dict):
    drv = standing.get("Driver", {})
    cons = standing.get("Constructors", [{}])
    return {
        "season": season,
        "full_name": f"{drv.get('givenName','')} {drv.get('familyName','')}".strip(),
        "driver_id": drv.get("driverId", ""),
        "constructor_name": cons[0].get("name", "") if cons else "",
        "points": float(standing.get("points", 0)),
        "wins": int(standing.get("wins", 0)),
    }


@router.get("/champions")
async def get_champions():
    global _champions_cache
    if _champions_cache is not None:
        return {"champions": _champions_cache}

    results = []
    for year in range(START_YEAR, END_YEAR + 1):
        try:
            standings = await ergast.get_driver_standings(year)
            if standings:
                results.append(_build_champion_entry(year, standings[0]))
        except Exception:
            continue

    _champions_cache = results
    return {"champions": results}


@router.get("/driver/{driver_id}")
async def get_driver_history(driver_id: str):
    if driver_id in _driver_history_cache:
        return {"driver_id": driver_id, "history": _driver_history_cache[driver_id]}

    history = []
    for year in range(START_YEAR, END_YEAR + 1):
        try:
            standings = await ergast.get_driver_standings(year)
            for s in standings:
                if s.get("Driver", {}).get("driverId") == driver_id:
                    cons = s.get("Constructors", [{}])
                    history.append({
                        "season": year,
                        "position": int(s.get("position", 0)),
                        "points": float(s.get("points", 0)),
                        "wins": int(s.get("wins", 0)),
                        "constructor_name": cons[0].get("name", "") if cons else "",
                    })
                    break
        except Exception:
            continue

    if not history:
        raise HTTPException(status_code=404, detail="No historical data found for this driver in 2015-2025")

    _driver_history_cache[driver_id] = history
    return {"driver_id": driver_id, "history": history}
