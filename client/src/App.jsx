import React, { useState } from "react";
import { ls } from "./api/client";
import { toast } from "./utils/toast";
import { GLOBAL_CSS } from "./styles/global";
import { ToastContainer } from "./components/ui/ToastContainer";
import { Sidebar } from "./components/layout/Sidebar";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TasksPage } from "./pages/TasksPage";
import { AdminPage } from "./pages/AdminPage";

export function App() {
  const [token, setToken] = useState(ls.get("token") || "");
  const [user,  setUser]  = useState(ls.get("user")  || null);
  const [page,  setPage]  = useState("dashboard");

  function handleAuth(tok, usr) {
    setToken(tok);
    setUser(usr);
    ls.set("token", tok);
    ls.set("user", usr);
    setPage("dashboard");
  }

  function logout() {
    setToken("");
    setUser(null);
    ls.del("token");
    ls.del("user");
    toast("Signed out", "info");
  }

  const isLoggedIn = Boolean(token && user);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <ToastContainer />

      {!isLoggedIn ? (
        <AuthPage onAuth={handleAuth} />
      ) : (
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar page={page} setPage={setPage} user={user} onLogout={logout} />
          <main style={{ flex: 1, overflow: "auto" }}>
            {page === "dashboard" && <DashboardPage token={token} user={user} />}
            {page === "projects"  && <ProjectsPage  token={token} user={user} />}
            {page === "tasks"     && <TasksPage      token={token} user={user} />}
            {page === "admin"     && user?.role === "admin" && (
              <AdminPage token={token} />
            )}
          </main>
        </div>
      )}
    </>
  );
}
