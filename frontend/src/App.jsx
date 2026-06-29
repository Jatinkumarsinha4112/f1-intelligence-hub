import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./services/api";
import DriverProfile from "./pages/DriverProfile";
import Compare from "./pages/Compare";

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
  "RB F1 Team": "#6692FF",
};

function Dashboard() {
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/drivers/2025/standings")
      .then((r) => setDrivers(r.data.standings))
      .catch(console.error);
    api.get("/standings/2025/constructors")
      .then((r) => setConstructors(r.data.standings))
      .catch(console.error);
  }, []);

  const filteredDrivers = drivers.filter((d) =>
    d.driver.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.constructor_name.toLowerCase().includes(search.toLowerCase())
  );

  const leader = drivers[0];

  return (
    <div style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", color: "white", fontFamily: "Arial, sans-serif" }}>

      {/* Red top bar */}
      <div style={{ height: "4px", backgroundColor: "#e10600" }} />

      {/* Header */}
      <div style={{ padding: "24px 40px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "28px" }}>🏎️</span>
        <span style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "1px" }}>F1 INTELLIGENCE HUB</span>
        <Link to="/compare" style={{ color: "white", textDecoration: "none", fontSize: "13px", fontWeight: "700", backgroundColor: "#e10600", padding: "8px 16px", borderRadius: "6px", marginLeft: "auto" }}>Compare Drivers</Link><span style={{ fontSize: "13px", color: "#888" }}>2025 Season</span>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Stats cards */}
        {leader && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
            {[
              { label: "Championship Leader", value: leader.driver.full_name, sub: `${leader.points} pts` },
              { label: "Total Drivers", value: drivers.length, sub: "2025 Season" },
              { label: "Total Teams", value: constructors.length, sub: "Constructors" },
            ].map((card) => (
              <div key={card.label} style={{
                backgroundColor: "#1a1a1a",
                borderRadius: "12px",
                padding: "20px 24px",
                borderTop: "3px solid #e10600",
              }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                  {card.label}
                </div>
                <div style={{ fontSize: "24px", fontWeight: "900" }}>{card.value}</div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{card.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Driver Standings */}
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", letterSpacing: "1px", textTransform: "uppercase" }}>
          Driver Standings
        </h2>

        <input
          type="text"
          placeholder="Search driver or team..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: "16px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div style={{ backgroundColor: "#1a1a1a", borderRadius: "12px", overflow: "hidden", marginBottom: "48px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#111", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#888" }}>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Pos</th>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Driver</th>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Team</th>
                <th style={{ padding: "14px 16px", textAlign: "right" }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d, i) => {
                const color = teamColors[d.constructor_name] || "#888";
                return (
                  <tr key={d.driver.driver_id} style={{
                    borderTop: "1px solid #222",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#222"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: "bold", color: i === 0 ? "#e10600" : "#aaa", fontSize: "15px" }}>
                      {d.position}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link
                        to={`/driver/${d.driver.driver_id}`}
                        style={{ color: "white", textDecoration: "none", fontWeight: "600", fontSize: "15px" }}
                        onMouseEnter={(e) => e.target.style.color = color}
                        onMouseLeave={(e) => e.target.style.color = "white"}
                      >
                        {d.driver.full_name}
                      </Link>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        display: "inline-block",
                        width: "3px",
                        height: "14px",
                        backgroundColor: color,
                        borderRadius: "2px",
                        marginRight: "8px",
                        verticalAlign: "middle",
                      }} />
                      <span style={{ color: "#ccc", fontSize: "14px" }}>{d.constructor_name}</span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: "700", fontSize: "15px" }}>
                      {d.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Constructor Standings */}
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", letterSpacing: "1px", textTransform: "uppercase" }}>
          Constructor Standings
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {constructors.map((team) => {
            const color = teamColors[team.constructor_name] || "#888";
            return (
              <div key={team.constructor_name} style={{
                backgroundColor: "#1a1a1a",
                borderRadius: "10px",
                padding: "20px",
                borderLeft: `4px solid ${color}`,
              }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>#{team.position}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>{team.constructor_name}</div>
                <div style={{ fontSize: "24px", fontWeight: "900", color }}>{team.points}</div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>points · {team.wins} wins</div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/driver/:driverId" element={<DriverProfile />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </BrowserRouter>
  );
}
