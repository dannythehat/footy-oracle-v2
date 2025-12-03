import { useEffect, useState } from "react";
import { fixturesApi } from "../services/api";

export default function MatchPage() {
  const fixtureId = window.location.pathname.split("/").pop();
  const [data, setData] = useState(null);

  useEffect(() => {
    fixturesApi.getComplete(fixtureId).then((d) => {
      console.log("COMPLETE DATA:", d);
      setData(d?.data || {});
    });
  }, [fixtureId]);

  if (!data) return <div style={{ color: "#fff" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px", background: "#111", minHeight: "100vh", color: "#fff" }}>
      <h2>{data.fixture?.homeTeam} vs {data.fixture?.awayTeam}</h2>
      <p style={{ opacity: 0.7 }}>{data.fixture?.league}</p>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => (window.location.href = "/")}>? Fixtures</button>
      </div>

      <pre style={{ marginTop: "20px", background: "#222", padding: "10px" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
