import React from "react";

export function PagePad({ children }) {
  return (
    <div style={{ padding: 28, display: "grid", gap: 20 }}>
      {children}
    </div>
  );
}

export function PageCenter({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "center", height: 300,
    }}>
      {children}
    </div>
  );
}

export function PageHeader({ title, sub, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: sub ? 4 : 0 }}>
        {title}
      </h1>
      {sub && <p style={{ color: "#606880", fontSize: 13 }}>{sub}</p>}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: "#606880",
      textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

export function Empty({ children }) {
  return (
    <p style={{ color: "#606880", fontSize: 13, padding: "12px 0" }}>
      {children}
    </p>
  );
}
