import { useParams, Link } from "react-router-dom";
import driverData from "../data/driverData";

function StatCard({ label, value, color }) {
  return (
    <div style={{
      backgroundColor: "#111",
      borderRadius: "10px",
      padding: "16px",
      textAlign: "center",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: "28px", fontWeight: "900", color: "white" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

function DriverProfile() {
  const { driverId } = useParams();
  const driver = driverData[driverId];

  const displayName = driverId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  if (!driver) {
    return (
      <div style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏎️</div>
        <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Driver not found</h2>
        <p style={{ color: "#888", marginBottom: "24px" }}>
          We don't have a profile for <strong style={{ color: "white" }}>{driverId}</strong> yet.
        </p>
        <Link to="/" style={{ color: "#e10600", textDecoration: "none", fontWeight: "bold", border: "1px solid #e10600", padding: "10px 24px", borderRadius: "8px" }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", color: "white", fontFamily: "Arial, sans-serif" }}>

      {/* Team colour bar at top */}
      <div style={{ height: "4px", backgroundColor: driver.teamColor }} />

      {/* Nav */}
      <div style={{ padding: "16px 40px", borderBottom: "1px solid #1a1a1a" }}>
        <Link to="/" style={{ color: "#aaa", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Hero section */}
      <div style={{
        background: `linear-gradient(135deg, #0f0f0f 60%, ${driver.teamColor}22 100%)`,
        padding: "48px 40px",
        display: "flex",
        gap: "48px",
        flexWrap: "wrap",
        alignItems: "flex-start",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>

        {/* Photo */}
        <div style={{ flex: "0 0 260px" }}>
          <img
            src={driver.image}
            alt={displayName}
            style={{
              width: "260px",
              height: "300px",
              objectFit: "cover",
              objectPosition: "top",
              borderRadius: "16px",
              border: `3px solid ${driver.teamColor}`,
              display: "block",
            }}
            onError={(e) => {
              e.target.src = `https://placehold.co/260x300/1a1a1a/ffffff?text=${displayName}`;
            }}
          />
        </div>

        {/* Name + basic info */}
        <div style={{ flex: 1, minWidth: "260px" }}>

          {/* Number badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: driver.teamColor,
            color: "white",
            fontWeight: "900",
            fontSize: "16px",
            marginBottom: "16px",
          }}>
            {driver.number}
          </div>

          <h1 style={{ fontSize: "44px", fontWeight: "900", margin: "0 0 6px 0", lineHeight: 1 }}>
            {displayName}
          </h1>

          <p style={{ color: driver.teamColor, fontSize: "18px", fontWeight: "700", margin: "0 0 24px 0" }}>
            {driver.team}
          </p>

          {/* Personal details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
            {[
              { label: "Nationality", value: driver.nationality },
              { label: "Date of Birth", value: driver.dob },
              { label: "Car Number", value: `#${driver.number}` },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", width: "120px", flexShrink: 0 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "15px", fontWeight: "600" }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Championships badge */}
          {driver.championships > 0 && (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FFD70022",
              border: "1px solid #FFD700",
              borderRadius: "8px",
              padding: "8px 16px",
            }}>
              <span style={{ fontSize: "20px" }}>🏆</span>
              <span style={{ color: "#FFD700", fontWeight: "700", fontSize: "14px" }}>
                {driver.championships}× World Champion
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats section */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 40px 40px" }}>

        <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "#888", marginBottom: "16px" }}>
          Career Statistics
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginBottom: "40px" }}>
          <StatCard label="Race Wins" value={driver.wins} color={driver.teamColor} />
          <StatCard label="Podiums" value={driver.podiums} color={driver.teamColor} />
          <StatCard label="Pole Positions" value={driver.poles} color={driver.teamColor} />
          <StatCard label="Fastest Laps" value={driver.fastestLaps} color={driver.teamColor} />
          <StatCard label="Championships" value={driver.championships} color="#FFD700" />
        </div>

        {/* Bio */}
        <div style={{ backgroundColor: "#1a1a1a", borderRadius: "12px", padding: "24px", marginBottom: "24px", borderLeft: `4px solid ${driver.teamColor}` }}>
          <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "#888", marginBottom: "12px" }}>
            About
          </h2>
          <p style={{ fontSize: "15px", color: "#ccc", lineHeight: "1.7", margin: 0 }}>
            {driver.bio}
          </p>
        </div>

        {/* Team info */}
        <div style={{ backgroundColor: "#1a1a1a", borderRadius: "12px", padding: "24px", borderLeft: `4px solid ${driver.teamColor}` }}>
          <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "#888", marginBottom: "12px" }}>
            About {driver.team}
          </h2>
          <p style={{ fontSize: "15px", color: "#ccc", lineHeight: "1.7", margin: 0 }}>
            {driver.teamInfo}
          </p>
        </div>

      </div>
    </div>
  );
}

export default DriverProfile;
