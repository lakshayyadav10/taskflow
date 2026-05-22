import React from "react";
import { Badge } from "../ui/Badge";
import { Btn } from "../ui/Btn";

const NAV_ITEMS = [
  { id: "dashboard", icon: "◈", label: "Dashboard" },
  { id: "projects",  icon: "⬡", label: "Projects"  },
  { id: "tasks",     icon: "✦", label: "Tasks"      },
];

export function Sidebar({ page, setPage, user, onLogout }) {
  const isAdmin = user?.role === "admin";
  const nav = [
    ...NAV_ITEMS,
    ...(isAdmin ? [{ id: "admin", icon: "⚙", label: "Admin" }] : []),
  ];

  return (
    <aside style={{
      width: 216, minHeight: "100vh",
      background: "#13161e", borderRight: "1px solid #252a38",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #252a38" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>⬡</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>TaskFlow</span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: "10px 8px", flex: 1 }}>
        {nav.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                width: "100%", padding: "9px 11px", borderRadius: 7, marginBottom: 2,
                background: active ? "rgba(91,124,250,.1)" : "transparent",
                color: active ? "#5b7cfa" : "#606880",
                border: active ? "1px solid rgba(91,124,250,.2)" : "1px solid transparent",
                fontSize: 13.5, fontWeight: 500, cursor: "pointer",
                textAlign: "left", transition: "all .12s", fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User panel */}
      <div style={{ padding: 12, borderTop: "1px solid #252a38" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#1a1e2a", borderRadius: 8,
          padding: "10px 11px", marginBottom: 8,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #5b7cfa, #9b7fd4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
          }}>
            {(user?.name || "?")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.name}
            </div>
            <Badge color={isAdmin ? "blue" : "dim"}>
              {isAdmin ? "Admin" : "Member"}
            </Badge>
          </div>
        </div>

        <Btn
          variant="ghost"
          size="sm"
          onClick={onLogout}
          style={{ width: "100%", justifyContent: "center" }}
        >
          Sign out
        </Btn>
      </div>
    </aside>
  );
}
