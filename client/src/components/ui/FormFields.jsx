import React from "react";
import { inputStyle } from "../../constants";

export function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 5 }}>
      {label && (
        <label style={{
          fontSize: 12, color: "#606880", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: ".04em",
        }}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

export function TextInput({ label, ...props }) {
  return (
    <Field label={label}>
      <input
        style={inputStyle}
        {...props}
        onFocus={(e) => {
          e.target.style.borderColor = "#5b7cfa";
          e.target.style.boxShadow = "0 0 0 2px rgba(91,124,250,.2)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#2e3447";
          e.target.style.boxShadow = "none";
        }}
      />
    </Field>
  );
}

export function SelectInput({ label, children, ...props }) {
  return (
    <Field label={label}>
      <select style={{ ...inputStyle, appearance: "auto" }} {...props}>
        {children}
      </select>
    </Field>
  );
}
