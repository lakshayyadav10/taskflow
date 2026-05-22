import React from "react";

export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#13161e",
        border: "1px solid #252a38",
        borderRadius: 12,
        padding: 18,
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
