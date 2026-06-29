from fastapi import APIRouter, HTTPException
from typing import Optional
from app.services.ergast_service import ergast, _get
from app.config import settings

router = APIRouter(prefix="/drivers", tags=["Drivers"])

def _build_driver(d):
    return {
        "driver_id": d.get("driverId", ""),
        "code": d.get("code"),
        "permanent_number": d.get("permanentNumber"),
        "full_name": f"{d.get('givenName','')} {d.get('familyName','')}".strip(),
        "nationality": d.get("nationality", ""),
        "date_of_birth": d.get("dateOfBirth"),
    }

def _build_standing(s):
    drv = s.get("Driver", {})
    cons = s.get("Constructors", [{}])
    return {
        "position": int(s.get("position", 0)),
        "points": float(s.get("points", 0)),
        "wins": int(s.get("wins", 0)),
        "driver": _build_driver(drv),
        "constructor_name": cons[0].get("name", "") if cons else "",
    }

@router.get("/{season}/list")
async def get_drivers(season: int):
    try:
        drivers = await ergast.get_drivers(season)
        return {"season": season, "total": len(drivers), "drivers": [_build_driver(d) for d in drivers]}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/{season}/standings")
async def get_driver_standings(season: int, round: Optional[int] = None):
    try:
        standings = await ergast.get_driver_standings(season, round)
        if not standings:
            raise HTTPException(status_code=404, detail="Standings not available")
        return {"season": season, "standings": [_build_standing(s) for s in standings]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/profile/{driver_id}")
async def get_driver_profile(driver_id: str, season: int = 2024):
    try:
        data = await _get(f"{settings.ERGAST_BASE_URL}/drivers/{driver_id}.json")
        drivers = data["MRData"]["DriverTable"]["Drivers"]
        if not drivers:
            raise HTTPException(status_code=404, detail="Driver not found")
        season_races = await ergast.get_driver_season_results(driver_id, season)
        race_chart = []
        for race in season_races:
            results = race.get("Results", [])
            if results:
                pos = results[0].get("position", "R")
                try:
                    pos_int = int(pos)
                except ValueError:
                    pos_int = None
                race_chart.append({
                    "round": int(race["round"]),
                    "race_name": race.get("raceName", ""),
                    "position": pos_int,
                    "points": float(results[0].get("points", 0)),
                    "status": results[0].get("status", ""),
                })
        return {
            "driver": _build_driver(drivers[0]),
            "season": season,
            "race_results": race_chart,
            "season_points": sum(r["points"] for r in race_chart),
            "season_wins": sum(1 for r in race_chart if r["position"] == 1),
            "season_podiums": sum(1 for r in race_chart if r["position"] and r["position"] <= 3),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/compare")
async def compare_drivers(driver1: str, driver2: str, season: int = 2025):
    try:
        standings = await ergast.get_driver_standings(season)
        if not standings:
            raise HTTPException(status_code=404, detail="Standings not available")

        def find(driver_id: str):
            for s in standings:
                if s["Driver"]["driverId"] == driver_id:
                    return _build_standing(s)
            return None

        d1 = find(driver1)
        d2 = find(driver2)
        if not d1 or not d2:
            raise HTTPException(status_code=404, detail="One or both drivers not found in this season's standings")

        r1 = await ergast.get_driver_season_results(driver1, season)
        r2 = await ergast.get_driver_season_results(driver2, season)

        def summarize(races):
            podiums = 0
            dnfs = 0
            for race in races:
                results = race.get("Results", [])
                if results:
                    pos = results[0].get("position")
                    status = results[0].get("status", "")
                    try:
                        if int(pos) <= 3:
                            podiums += 1
                    except (ValueError, TypeError):
                        pass
                    if "Finished" not in status and "Lap" not in status:
                        dnfs += 1
            return {"podiums": podiums, "dnfs": dnfs, "races_completed": len(races)}

        return {
            "season": season,
            "driver1": {**d1, "season_stats": summarize(r1)},
            "driver2": {**d2, "season_stats": summarize(r2)},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/compare")
async def compare_drivers(driver1: str, driver2: str, season: int = 2025):
    try:
        standings = await ergast.get_driver_standings(season)
        if not standings:
            raise HTTPException(status_code=404, detail="Standings not available")

        def find(driver_id: str):
            for s in standings:
                if s["Driver"]["driverId"] == driver_id:
                    return _build_standing(s)
            return None

        d1 = find(driver1)
        d2 = find(driver2)
        if not d1 or not d2:
            raise HTTPException(status_code=404, detail="One or both drivers not found in this season's standings")

        r1 = await ergast.get_driver_season_results(driver1, season)
        r2 = await ergast.get_driver_season_results(driver2, season)

        def summarize(races):
            podiums = 0
            dnfs = 0
            for race in races:
                results = race.get("Results", [])
                if results:
                    pos = results[0].get("position")
                    status = results[0].get("status", "")
                    try:
                        if int(pos) <= 3:
                            podiums += 1
                    except (ValueError, TypeError):
                        pass
                    if "Finished" not in status and "Lap" not in status:
                        dnfs += 1
            return {"podiums": podiums, "dnfs": dnfs, "races_completed": len(races)}

        return {
            "season": season,
            "driver1": {**d1, "season_stats": summarize(r1)},
            "driver2": {**d2, "season_stats": summarize(r2)},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
