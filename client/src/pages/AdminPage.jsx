import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { toast } from "../utils/toast";
import { STATUS } from "../constants";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Avatar } from "../components/ui/Avatar";
import { PagePad, PageCenter, PageHeader, SectionLabel, Empty } from "../components/layout/PageLayout";

export function AdminPage({ token }) {
  const [users, setUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/v1/admin/users", {}, token),
      api("/v1/admin/tasks", {}, token),
    ])
      .then(([ud, td]) => {
        setUsers(ud.data?.users || []);
        setAllTasks(td.data?.tasks || []);
      })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <PageCenter><Spinner size={30} /></PageCenter>;

  return (
    <PagePad>
      <PageHeader title="Admin" sub="Site-wide user and task management" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Users panel */}
        <Card>
          <SectionLabel>All Users ({users.length})</SectionLabel>
          <div style={{ display: "grid", gap: 7 }}>
            {users.map((u) => (
              <div key={u._id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", background: "#1a1e2a",
                borderRadius: 7, border: "1px solid #252a38",
              }}>
                <Avatar name={u.name} admin={u.role === "admin"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                  <div style={{
                    fontSize: 11, color: "#606880",
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {u.email}
                  </div>
                </div>
                <Badge color={u.role === "admin" ? "blue" : "dim"}>{u.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Tasks panel */}
        <Card>
          <SectionLabel>All Tasks ({allTasks.length})</SectionLabel>
          <div style={{ display: "grid", gap: 7, maxHeight: 500, overflowY: "auto" }}>
            {allTasks.length === 0
              ? <Empty>No tasks yet</Empty>
              : allTasks.map((t) => (
                <div key={t._id} style={{
                  padding: "9px 12px", background: "#1a1e2a",
                  borderRadius: 7, border: "1px solid #252a38",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    gap: 8, marginBottom: 3,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</span>
                    <Badge color={STATUS[t.status]?.color}>
                      {STATUS[t.status]?.label || t.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 11, color: "#606880" }}>
                    {t.projectId?.name && <span>📁 {t.projectId.name} · </span>}
                    {t.assignedTo
                      ? `→ ${t.assignedTo.name || t.assignedTo.email}`
                      : "Unassigned"}
                    {t.dueDate && ` · Due ${new Date(t.dueDate).toLocaleDateString()}`}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </PagePad>
  );
}
