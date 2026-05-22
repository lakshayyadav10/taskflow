import React from "react";
import { Spinner } from "./Spinner";

const variants = {
  default: { background: "#1a1e2a", color: "#e8eaf0", border: "1px solid #2e3447" },
  primary: { background: "#5b7cfa", color: "#fff",    border: "1px solid #5b7cfa" },
  danger:  { background: "rgba(241,107,107,.1)", color: "#f16b6b", border: "1px solid rgba(241,107,107,.3)" },
  ghost:   { background: "transparent", color: "#606880", border: "1px solid transparent" },
  green:   { background: "rgba(62,207,142,.1)", color: "#3ecf8e", border: "1px solid rgba(62,207,142,.3)" },
};

const sizes = {
  sm: { padding: "5px 11px",  fontSize: 12,   borderRadius: 6 },
  md: { padding: "9px 17px",  fontSize: 13.5, borderRadius: 7 },
  lg: { padding: "12px 24px", fontSize: 15,   borderRadius: 9 },
};

export function Btn({
  children,
  variant = "default",
  size = "md",
  loading,
  onClick,
  type = "button",
  style,
  disabled,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontWeight: 500,
        transition: "filter .12s",
        fontFamily: "inherit",
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.filter = "brightness(1.13)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
    >
      {loading ? <Spinner size={13} /> : null}
      {children}
    </button>
  );
}
