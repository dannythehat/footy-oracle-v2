export default function MatchStats({ stats }) {
  if (!stats || !stats.statistics) return null;

  const data = stats.statistics;

  return (
    <div style={{ padding: "20px", color: "#fff" }}>
      <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Match Stats</h3>

      <div style={{ display: "grid", gap: "10px" }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              background: "#222",
              padding: "10px",
              borderRadius: "6px"
            }}
          >
            <span>{item.type}</span>
            <span>{item.home} - {item.away}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
