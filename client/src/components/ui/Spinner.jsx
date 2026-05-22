import React from "react";

export function Spinner({ size = 20 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: "2px solid #252a38", borderTopColor: "#5b7cfa",
      borderRadius: "50%", animation: "spin .6s linear infinite",
    }} />
  );
}
