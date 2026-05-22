import React, { useState } from "react";
import { api } from "../api/client";
import { toast } from "../utils/toast";
import { Card } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { TextInput } from "../components/ui/FormFields";

export function AuthPage({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const path = tab === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register";
      const body = tab === "login"
        ? { email: form.email, password: form.password }
        : form;
      const data = await api(path, { method: "POST", body: JSON.stringify(body) });
      onAuth(data.token, data.user);
      toast("Welcome, " + data.user.name + "!", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
      background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,124,250,.15) 0%, transparent 70%)",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20,
            background: "#13161e", border: "1px solid #252a38",
            borderRadius: 12, padding: "8px 18px",
          }}>
            <span style={{ fontSize: 22 }}>⬡</span>
            <span style={{ fontWeight: 700, fontSize: 18 }}>TaskFlow</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
            {tab === "login" ? "Sign in" : "Create account"}
          </h1>
          <p style={{ color: "#606880", fontSize: 14 }}>
            {tab === "login" ? "Access your workspace" : "Start managing projects today"}
          </p>
        </div>

        <Card>
          {/* Tab switcher */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "#0d0f14", borderRadius: 8, padding: 4, marginBottom: 22,
          }}>
            {["login", "register"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 0", borderRadius: 6, fontSize: 13.5,
                border: "none", cursor: "pointer", fontWeight: 600,
                fontFamily: "inherit",
                background: tab === t ? "#1a1e2a" : "transparent",
                color: tab === t ? "#e8eaf0" : "#606880",
                transition: "all .15s",
              }}>
                {t === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
            {tab === "register" && (
              <TextInput
                label="Full Name" placeholder="Your name"
                value={form.name} onChange={f("name")} required
              />
            )}
            <TextInput
              label="Email" type="email" placeholder="you@example.com"
              value={form.email} onChange={f("email")} required
            />
            <TextInput
              label="Password"
              type="password"
              placeholder={tab === "register" ? "Min. 8 characters" : "••••••••"}
              value={form.password} onChange={f("password")} required
            />

            {tab === "register" && (
              <p style={{
                fontSize: 12, color: "#606880", lineHeight: 1.6,
                background: "rgba(91,124,250,.05)",
                border: "1px solid rgba(91,124,250,.15)",
                borderRadius: 7, padding: "10px 12px",
              }}>
                ℹ️ New accounts start as <strong style={{ color: "#e8eaf0" }}>Member</strong>.
                Ask an Admin to promote you, or update your role via MongoDB Compass.
              </p>
            )}

            <Btn
              variant="primary" size="lg" type="submit" loading={busy}
              style={{ marginTop: 4, justifyContent: "center" }}
            >
              {tab === "login" ? "Sign In →" : "Create Account →"}
            </Btn>
          </form>
        </Card>

        <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#606880" }}>
          {tab === "login" ? "No account? " : "Have an account? "}
          <button
            onClick={() => setTab(tab === "login" ? "register" : "login")}
            style={{
              background: "none", border: "none", color: "#5b7cfa",
              cursor: "pointer", fontWeight: 600, fontFamily: "inherit",
            }}
          >
            {tab === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
