import React, { useState } from "react";
import { registerToastHandler } from "../../utils/toast";

const colors = {
  info:    "#5b7cfa",
  success: "#3ecf8e",
  error:   "#f16b6b",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  // Register the add handler so the toast() utility can trigger it
  registerToastHandler((t) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== t.id)),
      3500
    );
  });

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      zIndex: 9999, display: "grid", gap: 8,
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: "#1a1e2a",
          border: `1px solid #2e3447`,
          borderLeft: `3px solid ${colors[t.type] || colors.info}`,
          borderRadius: 8,
          padding: "11px 16px",
          fontSize: 13,
          color: "#e8eaf0",
          boxShadow: "0 4px 20px rgba(0,0,0,.5)",
          maxWidth: 320,
          animation: "fadeUp .25s ease",
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
