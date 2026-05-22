import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { authRoutes }      from './modules/auth/auth.routes.js';
import { taskRoutes }      from './modules/tasks/task.routes.js';
import { projectRoutes }   from './modules/projects/project.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { adminRoutes }     from './modules/admin/admin.routes.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── API v1 routes ─────────────────────────────────────────────────────────────
app.use('/api/v1/auth',                          authRoutes);
app.use('/api/v1/projects',                      projectRoutes);
app.use('/api/v1/projects/:projectId/tasks',     taskRoutes);   // task routes scoped to a project
app.use('/api/v1/dashboard',                     dashboardRoutes);
app.use('/api/v1/admin',                         adminRoutes);

// ── Minimal API docs page (no extra dependency) ───────────────────────────────
app.get('/api-docs', (_req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Task Manager API</title>
  <style>body{font-family:monospace;max-width:800px;margin:40px auto;background:#0d0f14;color:#e8eaf0;padding:20px}
  h1{color:#5b7cfa}h2{color:#3ecf8e;margin-top:32px}pre{background:#1a1e2a;padding:16px;border-radius:8px;overflow:auto}
  .muted{color:#606880}</style></head><body>
  <h1>⬡ Task Manager API</h1>
  <p class="muted">Base URL: <code>http://localhost:${process.env.PORT || 5001}/api/v1</code></p>
  <h2>Auth</h2><pre>POST /auth/register\nPOST /auth/login\nGET  /auth/me</pre>
  <h2>Projects</h2><pre>GET    /projects\nPOST   /projects\nGET    /projects/:id\nPUT    /projects/:id            (project admin)\nDELETE /projects/:id            (project admin)\nPOST   /projects/:id/members    (project admin)\nDELETE /projects/:id/members/:userId (project admin)</pre>
  <h2>Tasks (scoped to a project)</h2><pre>GET    /projects/:projectId/tasks\nPOST   /projects/:projectId/tasks        (project admin)\nGET    /projects/:projectId/tasks/:id\nPUT    /projects/:projectId/tasks/:id\nDELETE /projects/:projectId/tasks/:id   (project admin)\nPATCH  /projects/:projectId/tasks/:id/assign (project admin)</pre>
  <h2>Dashboard</h2><pre>GET /dashboard</pre>
  <h2>Admin (global admin role)</h2><pre>GET /admin/users\nGET /admin/tasks</pre>
  </body></html>`);
});

// ── Central error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation error', details: err.errors });
  }
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';
  res.status(status).json({ error: message });
});


import cors from 'cors';

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

export default app;
