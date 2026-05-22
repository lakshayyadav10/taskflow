import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { toast } from "../utils/toast";
import { inputStyle } from "../constants";
import { Card } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { Spinner } from "../components/ui/Spinner";
import { TextInput, SelectInput, Field } from "../components/ui/FormFields";
import { PagePad, PageCenter, PageHeader } from "../components/layout/PageLayout";
import { KanbanColumn } from "./KanbanColumn";

const EMPTY_FORM = {
  title: "", description: "", priority: "medium",
  status: "todo", dueDate: "", assignedTo: "",
};

export function TasksPage({ token, user }) {
  const [projects, setProjects] = useState([]);
  const [selProject, setSelProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const F = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // Load projects on mount
  useEffect(() => {
    api("/v1/projects", {}, token)
      .then((d) => {
        const ps = d.projects || [];
        setProjects(ps);
        if (ps.length > 0) setSelProject(ps[0]);
      })
      .catch((e) => toast(e.message, "error"));
  }, [token]);

  // Load tasks whenever selected project changes
  const loadTasks = useCallback(async (proj) => {
    if (!proj) return;
    setLoading(true);
    try {
      const d = await api(`/v1/projects/${proj._id}/tasks`, {}, token);
      setTasks(d.tasks || []);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadTasks(selProject); }, [selProject, loadTasks]);

  const isAdmin = selProject?.members?.find(
    (m) => (m.user?._id || m.user) === (user?.id || user?._id)
  )?.role === "admin";

  // Group tasks by status for kanban columns
  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => { (g[t.status] || g.todo).push(t); });
    return g;
  }, [tasks]);

  async function submitForm(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...form };
      if (!body.dueDate) delete body.dueDate;
      if (!body.assignedTo) delete body.assignedTo;
      const url = editing
        ? `/v1/projects/${selProject._id}/tasks/${editing._id}`
        : `/v1/projects/${selProject._id}/tasks`;
      await api(url, { method: editing ? "PUT" : "POST", body: JSON.stringify(body) }, token);
      toast(editing ? "Task updated!" : "Task created!", "success");
      setForm(EMPTY_FORM);
      setEditing(null);
      setShowForm(false);
      loadTasks(selProject);
    } catch (e) { toast(e.message, "error"); }
    finally { setBusy(false); }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
      await api(`/v1/projects/${selProject._id}/tasks/${id}`, { method: "DELETE" }, token);
      toast("Task deleted", "success");
      setTasks((t) => t.filter((x) => x._id !== id));
    } catch (e) { toast(e.message, "error"); }
  }

  async function quickStatus(task, status) {
    try {
      await api(`/v1/projects/${selProject._id}/tasks/${task._id}`, {
        method: "PUT", body: JSON.stringify({ status }),
      }, token);
      setTasks((ts) => ts.map((t) => t._id === task._id ? { ...t, status } : t));
    } catch (e) { toast(e.message, "error"); }
  }

  function startEdit(task) {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  if (projects.length === 0) {
    return (
      <PagePad>
        <PageHeader title="Tasks" />
        <Card style={{ textAlign: "center", padding: 52 }}>
          <p style={{ color: "#606880" }}>
            Join or create a project first — then manage tasks here.
          </p>
        </Card>
      </PagePad>
    );
  }

  return (
    <PagePad>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <PageHeader title="Tasks" noMargin />
        <select
          value={selProject?._id || ""}
          onChange={(e) => setSelProject(projects.find((p) => p._id === e.target.value))}
          style={{ ...inputStyle, width: "auto", marginLeft: "auto" }}
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        {isAdmin && (
          <Btn
            variant="primary"
            onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm((v) => !v); }}
          >
            {showForm ? "✕ Cancel" : "+ New Task"}
          </Btn>
        )}
      </div>

      {/* Task form */}
      {showForm && (
        <Card style={{ borderColor: "rgba(91,124,250,.3)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
            {editing ? "Edit Task" : "Create Task"}
          </div>
          <form onSubmit={submitForm} style={{ display: "grid", gap: 12 }}>
            <TextInput
              label="Title" value={form.title} onChange={F("title")}
              required placeholder="Task title…"
            />
            <Field label="Description">
              <textarea
                value={form.description} onChange={F("description")}
                placeholder="Optional…"
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
              />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <SelectInput label="Priority" value={form.priority} onChange={F("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </SelectInput>
              <SelectInput label="Status" value={form.status} onChange={F("status")}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </SelectInput>
              <TextInput label="Due Date" type="date" value={form.dueDate} onChange={F("dueDate")} />
            </div>
            {selProject?.members?.length > 0 && (
              <SelectInput label="Assign To" value={form.assignedTo} onChange={F("assignedTo")}>
                <option value="">Unassigned</option>
                {selProject.members.map((m) => {
                  const u = m.user || {};
                  return (
                    <option key={u._id || u} value={u._id || u}>
                      {u.name || u.email || u}
                    </option>
                  );
                })}
              </SelectInput>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="primary" type="submit" loading={busy}>
                {editing ? "Save Changes" : "Create Task"}
              </Btn>
              <Btn onClick={cancelForm}>Cancel</Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Kanban board */}
      {loading
        ? <PageCenter><Spinner size={28} /></PageCenter>
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {["todo", "in_progress", "done"].map((s) => (
              <KanbanColumn
                key={s}
                status={s}
                tasks={grouped[s] || []}
                isAdmin={isAdmin}
                onQuickStatus={quickStatus}
                onEdit={startEdit}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
    </PagePad>
  );
}
