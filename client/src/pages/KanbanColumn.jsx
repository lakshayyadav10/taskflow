import React from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Btn";
import { STATUS, PRIORITY } from "../constants";

export function KanbanCard({ task, status, isAdmin, onQuickStatus, onEdit, onDelete }) {
  return (
    <Card style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{task.title}</div>
        <Badge color={PRIORITY[task.priority]?.color}>{task.priority}</Badge>
      </div>

      {task.description && (
        <div style={{ fontSize: 12, color: "#606880", lineHeight: 1.5, marginBottom: 8 }}>
          {task.description.slice(0, 90)}{task.description.length > 90 ? "…" : ""}
        </div>
      )}

      <div style={{ fontSize: 11, color: "#606880", marginBottom: 8 }}>
        {task.assignedTo && (
          <span>→ {task.assignedTo.name || task.assignedTo.email}</span>
        )}
        {task.dueDate && (
          <span style={{
            marginLeft: task.assignedTo ? 8 : 0,
            color: new Date(task.dueDate) < new Date() && task.status !== "done"
              ? "#f16b6b" : "#606880",
          }}>
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {status !== "todo" && (
          <Btn
            variant="ghost" size="sm"
            onClick={() => onQuickStatus(task, status === "done" ? "in_progress" : "todo")}
          >
            ← {status === "done" ? "Reopen" : "To Do"}
          </Btn>
        )}
        {status !== "done" && (
          <Btn
            variant="green" size="sm"
            onClick={() => onQuickStatus(task, status === "todo" ? "in_progress" : "done")}
          >
            {status === "todo" ? "Start →" : "✓ Done"}
          </Btn>
        )}
        {isAdmin && <Btn variant="ghost"  size="sm" onClick={() => onEdit(task)}>Edit</Btn>}
        {isAdmin && <Btn variant="danger" size="sm" onClick={() => onDelete(task._id)}>Delete</Btn>}
      </div>
    </Card>
  );
}

export function KanbanColumn({ status, tasks, isAdmin, onQuickStatus, onEdit, onDelete }) {
  const meta = STATUS[status];
  return (
    <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Badge color={meta.color}>{meta.label}</Badge>
        <span style={{ fontSize: 11, color: "#606880" }}>{tasks.length}</span>
      </div>

      {tasks.map((task) => (
        <KanbanCard
          key={task._id}
          task={task}
          status={status}
          isAdmin={isAdmin}
          onQuickStatus={onQuickStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {tasks.length === 0 && (
        <div style={{
          border: "1px dashed #252a38", borderRadius: 10,
          padding: 24, textAlign: "center", color: "#606880", fontSize: 12,
        }}>
          Empty
        </div>
      )}
    </div>
  );
}
