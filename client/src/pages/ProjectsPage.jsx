import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { toast } from "../utils/toast";
import { inputStyle } from "../constants";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Btn";
import { Spinner } from "../components/ui/Spinner";
import { Avatar } from "../components/ui/Avatar";
import { TextInput } from "../components/ui/FormFields";
import { PagePad, PageCenter, PageHeader, SectionLabel } from "../components/layout/PageLayout";

/* ── Helper: resolves a member's user id regardless of shape ── */
function memberId(m) {
  return m.user?._id || m.user;
}
function userId(user) {
  return user?.id || user?._id;
}

/* ── Project detail panel ── */
function ProjectDetail({ detail, setDetail, isGlobalAdmin, allUsers, token, load }) {
  const [addId, setAddId] = useState("");

  const isProjAdmin = detail.members?.find(
    (m) => memberId(m) === userId(detail._currentUser)
  )?.role === "admin";

  const nonMembers = allUsers.filter(
    (u) => !detail.members?.some((m) => memberId(m) === u._id)
  );

  async function addMember() {
    if (!addId) return;
    try {
      await api(`/v1/projects/${detail._id}/members`, {
        method: "POST", body: JSON.stringify({ userId: addId, role: "member" }),
      }, token);
      toast("Member added!", "success");
      setAddId("");
      const d = await api(`/v1/projects/${detail._id}`, {}, token);
      setDetail(d.project);
    } catch (e) { toast(e.message, "error"); }
  }

  async function removeMember(uid) {
    try {
      await api(`/v1/projects/${detail._id}/members/${uid}`, { method: "DELETE" }, token);
      toast("Member removed", "success");
      const d = await api(`/v1/projects/${detail._id}`, {}, token);
      setDetail(d.project);
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <PagePad>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Btn variant="ghost" size="sm" onClick={() => { setDetail(null); load(); }}>← Back</Btn>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{detail.name}</h1>
          {detail.description && (
            <p style={{ color: "#606880", fontSize: 13 }}>{detail.description}</p>
          )}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Badge color={isProjAdmin ? "blue" : "dim"}>
            {isProjAdmin ? "Admin" : "Member"}
          </Badge>
        </div>
      </div>

      <Card>
        <SectionLabel>Members ({detail.members?.length || 0})</SectionLabel>
        <div style={{ display: "grid", gap: 7, marginBottom: isProjAdmin ? 16 : 0 }}>
          {detail.members?.map((m) => {
            const u = m.user || {};
            const uid = u._id || u;
            return (
              <div key={uid} style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 12px", background: "#1a1e2a",
                borderRadius: 7, border: "1px solid #252a38",
              }}>
                <Avatar name={u.name || "?"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name || "Unknown"}</div>
                  <div style={{ fontSize: 11, color: "#606880" }}>{u.email}</div>
                </div>
                <Badge color={m.role === "admin" ? "blue" : "dim"}>{m.role}</Badge>
                {isProjAdmin && m.role !== "admin" && (
                  <Btn variant="danger" size="sm" onClick={() => removeMember(uid)}>
                    Remove
                  </Btn>
                )}
              </div>
            );
          })}
        </div>

        {isProjAdmin && nonMembers.length > 0 && (
          <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: "1px solid #252a38" }}>
            <select
              value={addId} onChange={(e) => setAddId(e.target.value)}
              style={{ flex: 1, ...inputStyle }}
            >
              <option value="">Select user to add…</option>
              {nonMembers.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <Btn variant="green" size="sm" onClick={addMember}>+ Add</Btn>
          </div>
        )}
      </Card>
    </PagePad>
  );
}

/* ── Projects list ── */
export function ProjectsPage({ token, user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  const isGlobalAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    try {
      const d = await api("/v1/projects", {}, token);
      setProjects(d.projects || []);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isGlobalAdmin) return;
    api("/v1/admin/users", {}, token)
      .then((d) => setAllUsers(d.data?.users || []))
      .catch(() => {});
  }, [isGlobalAdmin, token]);

  async function createProject(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/v1/projects", { method: "POST", body: JSON.stringify(form) }, token);
      toast("Project created!", "success");
      setForm({ name: "", description: "" });
      setShowCreate(false);
      load();
    } catch (e) { toast(e.message, "error"); }
    finally { setBusy(false); }
  }

  function myRole(proj) {
    return proj.members?.find(
      (m) => (m.user?._id || m.user) === (user?.id || user?._id)
    )?.role;
  }

  if (loading) return <PageCenter><Spinner size={30} /></PageCenter>;

  if (detail) {
    return (
      <ProjectDetail
        detail={detail}
        setDetail={setDetail}
        isGlobalAdmin={isGlobalAdmin}
        allUsers={allUsers}
        token={token}
        load={load}
      />
    );
  }

  return (
    <PagePad>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <PageHeader title="Projects" sub="All projects you belong to" noMargin />
        <div style={{ marginLeft: "auto" }}>
          <Btn variant="primary" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "✕ Cancel" : "+ New Project"}
          </Btn>
        </div>
      </div>

      {showCreate && (
        <Card style={{ borderColor: "rgba(91,124,250,.3)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>New Project</div>
          <form onSubmit={createProject} style={{ display: "grid", gap: 12 }}>
            <TextInput
              label="Project Name" placeholder="e.g. Website Redesign"
              value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <TextInput
              label="Description (optional)" placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <Btn variant="primary" type="submit" loading={busy}>Create Project</Btn>
          </form>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 52 }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>⬡</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No projects yet</div>
          <p style={{ color: "#606880", fontSize: 13 }}>
            Create a project — you'll automatically become its Admin.
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {projects.map((p) => (
            <Card key={p._id} onClick={() => setDetail(p)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: "linear-gradient(135deg,#5b7cfa,#9b7fd4)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>⬡</div>
                <Badge color={myRole(p) === "admin" ? "blue" : "dim"}>{myRole(p)}</Badge>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
              {p.description && (
                <div style={{ fontSize: 12, color: "#606880", marginBottom: 10, lineHeight: 1.5 }}>
                  {p.description.slice(0, 80)}{p.description.length > 80 ? "…" : ""}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#606880" }}>
                {p.members?.length || 0} member{(p.members?.length || 0) !== 1 ? "s" : ""}
                {" · "}by {p.createdBy?.name || "you"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PagePad>
  );
}
