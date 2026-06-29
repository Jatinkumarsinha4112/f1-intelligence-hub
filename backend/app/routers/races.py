from fastapi import APIRouter, HTTPException
from typing import Optional
from app.services.ergast_service import ergast

router = APIRouter(prefix="/races", tags=["Races"])

def _build_result(r):
    drv = r.get("Driver", {})
    con = r.get("Constructor", {})
    fl  = r.get("FastestLap", {})
    return {
        "position": r.get("position"),
        "driver_code": drv.get("code", drv.get("driverId", "")),
        "driver_name": f"{drv.get('givenName','')} {drv.get('familyName','')}".strip(),
        "constructor": con.get("name", ""),
        "grid": int(r["grid"]) if r.get("grid") else None,
        "laps": int(r["laps"]) if r.get("laps") else None,
        "status": r.get("status"),
        "points": float(r["points"]) if r.get("points") else 0.0,
        "fastest_lap_time": fl.get("Time", {}).get("time") if fl else None,
    }

def _build_race(race):
    circuit = race.get("Circuit", {})
    loc = circuit.get("Location", {})
    return {
        "season": int(race["season"]),
        "round": int(race["round"]),
        "race_name": race.get("raceName", ""),
        "circuit_name": circuit.get("circuitName", ""),
        "country": loc.get("country", ""),
        "locality": loc.get("locality", ""),
        "date": race.get("date", ""),
        "time": race.get("time"),
    }

@router.get("/{season}")
async def get_schedule(season: int):
    try:
        races = await ergast.get_schedule(season)
        return {"season": season, "total": len(races), "races": [_build_race(r) for r in races]}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/current/last")
async def get_last_race():
    try:
        results = await ergast.get_last_race_results()
        return {"total": len(results), "results": [_build_result(r) for r in results]}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/{season}/{round}/results")
async def get_race_results(season: int, round: int):
    try:
        results = await ergast.get_race_results(season, round)
        if not results:
            raise HTTPException(status_code=404, detail="Results not available yet")
        return {"season": season, "round": round, "results": [_build_result(r) for r in results]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/{season}/{round}/qualifying")
async def get_qualifying_results(season: int, round: int):
    try:
        results = await ergast.get_qualifying_results(season, round)
        if not results:
            raise HTTPException(status_code=404, detail="Qualifying results not available")
        formatted = []
        for r in results:
            drv = r.get("Driver", {})
            con = r.get("Constructor", {})
            formatted.append({
                "position": int(r.get("position", 0)),
                "driver_code": drv.get("code", drv.get("driverId", "")),
                "driver_name": f"{drv.get('givenName','')} {drv.get('familyName','')}".strip(),
                "constructor": con.get("name", ""),
                "q1": r.get("Q1"), "q2": r.get("Q2"), "q3": r.get("Q3"),
            })
        return {"season": season, "round": round, "qualifying": formatted}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
