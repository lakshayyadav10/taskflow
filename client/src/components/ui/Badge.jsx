import React from "react";

const colorMap = {
  dim:    ["#1e2233", "#606880"],
  green:  ["rgba(62,207,142,.12)",  "#3ecf8e"],
  amber:  ["rgba(245,166,35,.12)",  "#f5a623"],
  red:    ["rgba(241,107,107,.12)", "#f16b6b"],
  blue:   ["rgba(91,124,250,.12)",  "#5b7cfa"],
  purple: ["rgba(123,94,167,.12)",  "#9b7fd4"],
};

export function Badge({ children, color = "dim" }) {
  const [bg, fg] = colorMap[color] || colorMap.dim;
  return (
    <span style={{
      display: "inline-block", background: bg, color: fg,
      borderRadius: 99, padding: "2px 9px", fontSize: 11,
      fontWeight: 600, letterSpacing: ".02em", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}
