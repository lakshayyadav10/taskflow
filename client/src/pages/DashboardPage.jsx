import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { toast } from "../utils/toast";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Avatar } from "../components/ui/Avatar";
import { PagePad, PageCenter, PageHeader, SectionLabel, Empty } from "../components/layout/PageLayout";

const STATS_CONFIG = [
  { label: "Total Tasks",  key: (d) => d?.total || 0,                  icon: "✦", color: "#5b7cfa" },
  { label: "To Do",        key: (d) => d?.byStatus?.todo || 0,         icon: "○", color: "#606880" },
  { label: "In Progress",  key: (d) => d?.byStatus?.in_progress || 0,  icon: "◐", color: "#f5a623" },
  { label: "Done",         key: (d) => d?.byStatus?.done || 0,         icon: "●", color: "#3ecf8e" },
  { label: "Overdue",      key: (d) => d?.overdue?.count || 0,         icon: "⚠", color: "#f16b6b" },
];

export function DashboardPage({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/v1/dashboard", {}, token)
      .then(setData)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <PageCenter><Spinner size={30} /></PageCenter>;

  return (
    <PagePad>
      <PageHeader title="Dashboard" sub="Overview across all projects" />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
        {STATS_CONFIG.map((s) => (
          <Card key={s.label} style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 22, color: s.color, marginBottom: 8 }}>{s.icon}</div>
            <div style={{
              fontSize: 28, fontWeight: 700, color: s.color,
              fontVariantNumeric: "tabular-nums",
            }}>
              {s.key(data)}
            </div>
            <div style={{ fontSize: 12, color: "#606880", marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Tasks per user */}
        <Card>
          <SectionLabel>Tasks per Member</SectionLabel>
          {(data?.byUser || []).length === 0
            ? <Empty>No assigned tasks yet</Empty>
            : (data.byUser || []).map((u) => (
              <div key={u.userId} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", background: "#1a1e2a",
                borderRadius: 7, border: "1px solid #252a38", marginBottom: 7,
              }}>
                <Avatar name={u.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                  <div style={{
                    fontSize: 11, color: "#606880",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{u.email}</div>
                </div>
                <Badge color="blue">{u.taskCount} tasks</Badge>
              </div>
            ))}
        </Card>

        {/* Overdue tasks */}
        <Card style={{ borderColor: (data?.overdue?.count || 0) > 0 ? "rgba(241,107,107,.25)" : "#252a38" }}>
          <SectionLabel>Overdue Tasks</SectionLabel>
          {(data?.overdue?.tasks || []).length === 0
            ? <Empty>No overdue tasks 🎉</Empty>
            : (data.overdue.tasks || []).slice(0, 6).map((t) => (
              <div key={t._id} style={{
                display: "flex", justifyContent: "space-between", gap: 8,
                padding: "9px 12px",
                background: "rgba(241,107,107,.04)",
                border: "1px solid rgba(241,107,107,.12)",
                borderRadius: 7, marginBottom: 7,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</div>
                  {t.assignedTo && (
                    <div style={{ fontSize: 11, color: "#606880" }}>→ {t.assignedTo.name}</div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#f16b6b", flexShrink: 0, paddingTop: 2 }}>
                  {new Date(t.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))}
        </Card>
      </div>
    </PagePad>
  );
}
