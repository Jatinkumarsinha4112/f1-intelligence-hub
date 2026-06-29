import httpx
from typing import Any, Dict, List, Optional
from app.config import settings

_TIMEOUT = httpx.Timeout(30.0)
_CACHE: Dict[str, Any] = {}

async def _get(url: str) -> Dict:
    if url in _CACHE:
        return _CACHE[url]
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
        _CACHE[url] = data
        return data

class ErgastService:
    BASE = settings.ERGAST_BASE_URL

    async def get_drivers(self, season: int) -> List[Dict]:
        data = await _get(f"{self.BASE}/{season}/drivers.json?limit=100")
        return data["MRData"]["DriverTable"]["Drivers"]

    async def get_schedule(self, season: int) -> List[Dict]:
        data = await _get(f"{self.BASE}/{season}.json")
        return data["MRData"]["RaceTable"]["Races"]

    async def get_race_results(self, season: int, round_num: int) -> List[Dict]:
        data = await _get(f"{self.BASE}/{season}/{round_num}/results.json")
        races = data["MRData"]["RaceTable"]["Races"]
        return races[0].get("Results", []) if races else []

    async def get_qualifying_results(self, season: int, round_num: int) -> List[Dict]:
        data = await _get(f"{self.BASE}/{season}/{round_num}/qualifying.json")
        races = data["MRData"]["RaceTable"]["Races"]
        return races[0].get("QualifyingResults", []) if races else []

    async def get_driver_standings(self, season: int, round_num: Optional[int] = None) -> List[Dict]:
        url = f"{self.BASE}/{season}/{round_num}/driverStandings.json" if round_num else f"{self.BASE}/{season}/driverStandings.json"
        data = await _get(url)
        tables = data["MRData"]["StandingsTable"]["StandingsLists"]
        return tables[0].get("DriverStandings", []) if tables else []

    async def get_constructor_standings(self, season: int, round_num: Optional[int] = None) -> List[Dict]:
        url = f"{self.BASE}/{season}/{round_num}/constructorStandings.json" if round_num else f"{self.BASE}/{season}/constructorStandings.json"
        data = await _get(url)
        tables = data["MRData"]["StandingsTable"]["StandingsLists"]
        return tables[0].get("ConstructorStandings", []) if tables else []

    async def get_seasons(self) -> List[int]:
        data = await _get(f"{self.BASE}/seasons.json?limit=100")
        return sorted([int(s["season"]) for s in data["MRData"]["SeasonTable"]["Seasons"]], reverse=True)

    async def get_circuits(self, season: int) -> List[Dict]:
        data = await _get(f"{self.BASE}/{season}/circuits.json")
        return data["MRData"]["CircuitTable"]["Circuits"]

    async def get_driver_season_results(self, driver_id: str, season: int) -> List[Dict]:
        data = await _get(f"{self.BASE}/{season}/drivers/{driver_id}/results.json?limit=100")
        return data["MRData"]["RaceTable"]["Races"]

    async def get_last_race_results(self) -> List[Dict]:
        data = await _get(f"{self.BASE}/current/last/results.json")
        races = data["MRData"]["RaceTable"]["Races"]
        return races[0].get("Results", []) if races else []

ergast = ErgastService()
