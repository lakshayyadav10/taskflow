import React from "react";

export function Avatar({ name = "?", admin = false }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
      background: admin
        ? "linear-gradient(135deg,#5b7cfa,#9b7fd4)"
        : "linear-gradient(135deg,#252a38,#3a3f54)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700,
      color: admin ? "#fff" : "#e8eaf0",
    }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}
