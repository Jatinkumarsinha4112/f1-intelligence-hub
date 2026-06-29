import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import driverData from "../data/driverData";

const teamColors = {
  "Red Bull": "#3671C6",
  "McLaren": "#FF8000",
  "Ferrari": "#E8002D",
  "Mercedes": "#27F4D2",
  "Aston Martin": "#229971",
  "Alpine F1 Team": "#FF87BC",
  "Williams": "#64C4FF",
  "Haas F1 Team": "#B6BABD",
  "Kick Sauber": "#52E252",
  "Sauber": "#52E252",
  "RB F1 Team": "#6692FF",
};

function displayName(driverId) {
  return driverId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function StatRow({ label, value1, value2, color1, color2, higherIsBetter = true }) {
  const max = Math.max(value1, value2, 1);
  const pct1 = (value1 / max) * 100;
  const pct2 = (value2 / max) * 100;
  const winner1 = higherIsBetter ? value1 >= value2 : value1 <= value2;

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#888", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
        <span style={{ fontWeight: winner1 ? "900" : "400", color: winner1 ? "white" : "#888" }}>{value1}</span>
        <span>{label}</span>
        <span style={{ fontWeight: !winner1 ? "900" : "400", color: !winner1 ? "white" : "#888" }}>{value2}</span>
      </div>
      <div style={{ display: "flex", gap: "4px", height: "8px" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: `${pct1}%`, backgroundColor: color1, borderRadius: "4px 0 0 4px", transition: "width 0.4s" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ width: `${pct2}%`, backgroundColor: color2, borderRadius: "0 4px 4px 0", transition: "width 0.4s" }} />
        </div>
      </div>
    </div>
  );
}

function DriverPickCard({ id, color }) {
  const meta = driverData[id];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <img
        src={meta?.image || "https://placehold.co/120x140/1a1a1a/ffffff?text=?"}
        alt={displayName(id)}
        style={{
          width: "120px",
          height: "140px",
          objectFit: "cover",
          objectPosition: "top",
          borderRadius: "12px",
          border: `3px solid ${color}`,
        }}
        onError={(e) => { e.target.src = "https://placehold.co/120x140/1a1a1a/ffffff?text=" + displayName(id); }}
      />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: "800", fontSize: "16px" }}>{displayName(id)}</div>
        <div style={{ color, fontSize: "12px", fontWeight: "700" }}>{meta?.team || ""}</div>
      </div>
    </div>
  );
}

export default function Compare() {
  const [allDrivers, setAllDrivers] = useState([]);
  const [driver1, setDriver1] = useState("norris");
  const [driver2, setDriver2] = useState("max_verstappen");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const season = 2025;

  useEffect(() => {
    api.get(`/drivers/${season}/standings`)
      .then((r) => setAllDrivers(r.data.standings.map((s) => s.driver.driver_id)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!driver1 || !driver2 || driver1 === driver2) return;
    setLoading(true);
    setError(null);
    api.get(`/drivers/compare`, { params: { driver1, driver2, season } })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.detail || "Could not load comparison"))
      .finally(() => setLoading(false));
  }, [driver1, driver2]);

  const color1 = data ? (teamColors[data.driver1.constructor_name] || "#888") : "#888";
  const color2 = data ? (teamColors[data.driver2.constructor_name] || "#888") : "#888";

  return (
    <div style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", color: "white", fontFamily: "Arial, sans-serif" }}>
      <div style={{ height: "4px", backgroundColor: "#e10600" }} />

      <div style={{ padding: "20px 40px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center" }}>
        <Link to="/" style={{ color: "#aaa", textDecoration: "none", fontSize: "14px" }}>Back to Dashboard</Link>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#888" }}>{season} Season</span>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "900", marginBottom: "24px", textAlign: "center" }}>
          Driver Comparison
        </h1>

        <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
          <select
            value={driver1}
            onChange={(e) => setDriver1(e.target.value)}
            style={{ flex: 1, padding: "12px", backgroundColor: "#1a1a1a", color: "white", border: "1px solid #333", borderRadius: "8px", fontSize: "14px" }}
          >
            {allDrivers.map((id) => (
              <option key={id} value={id}>{displayName(id)}</option>
            ))}
          </select>
          <select
            value={driver2}
            onChange={(e) => setDriver2(e.target.value)}
            style={{ flex: 1, padding: "12px", backgroundColor: "#1a1a1a", color: "white", border: "1px solid #333", borderRadius: "8px", fontSize: "14px" }}
          >
            {allDrivers.map((id) => (
              <option key={id} value={id}>{displayName(id)}</option>
            ))}
          </select>
        </div>

        {driver1 === driver2 && (
          <p style={{ textAlign: "center", color: "#e10600" }}>Pick two different drivers to compare.</p>
        )}

        {loading && <p style={{ textAlign: "center", color: "#888" }}>Loading comparison...</p>}
        {error && <p style={{ textAlign: "center", color: "#e10600" }}>{error}</p>}

        {data && !loading && (
          <>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "36px" }}>
              <DriverPickCard id={data.driver1.driver.driver_id} color={color1} />
              <div style={{ alignSelf: "center", fontSize: "20px", color: "#555", fontWeight: "900" }}>VS</div>
              <DriverPickCard id={data.driver2.driver.driver_id} color={color2} />
            </div>

            <div style={{ backgroundColor: "#1a1a1a", borderRadius: "16px", padding: "28px" }}>
              <StatRow label="Championship Points" value1={data.driver1.points} value2={data.driver2.points} color1={color1} color2={color2} />
              <StatRow label="Race Wins" value1={data.driver1.wins} value2={data.driver2.wins} color1={color1} color2={color2} />
              <StatRow label="Podiums" value1={data.driver1.season_stats.podiums} value2={data.driver2.season_stats.podiums} color1={color1} color2={color2} />
              <StatRow label="Championship Position" value1={data.driver1.position} value2={data.driver2.position} color1={color1} color2={color2} higherIsBetter={false} />
              <StatRow label="DNFs" value1={data.driver1.season_stats.dnfs} value2={data.driver2.season_stats.dnfs} color1={color1} color2={color2} higherIsBetter={false} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
