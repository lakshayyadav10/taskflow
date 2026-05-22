import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { authRoutes } from './modules/auth/auth.routes.js';
import { taskRoutes } from './modules/tasks/task.routes.js';
import { projectRoutes } from './modules/projects/project.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';

const app = express();

/* ─────────────────────────────────────────────────────────────
   Middleware
───────────────────────────────────────────────────────────── */

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://sweet-joy-production-4231.up.railway.app',
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

/* ─────────────────────────────────────────────────────────────
   Health Check
───────────────────────────────────────────────────────────── */

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
  });
});

/* ─────────────────────────────────────────────────────────────
   API Routes
───────────────────────────────────────────────────────────── */

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/projects', projectRoutes);

app.use('/api/v1/projects/:projectId/tasks', taskRoutes);

app.use('/api/v1/dashboard', dashboardRoutes);

app.use('/api/v1/admin', adminRoutes);

/* ─────────────────────────────────────────────────────────────
   API Docs
───────────────────────────────────────────────────────────── */

app.get('/api-docs', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Task Manager API</title>

        <style>
          body{
            font-family: Arial;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            background: #0f172a;
            color: white;
          }

          h1{
            color: #60a5fa;
          }

          pre{
            background: #1e293b;
            padding: 15px;
            border-radius: 10px;
            overflow-x: auto;
          }
        </style>
      </head>

      <body>
        <h1>Task Manager API</h1>

        <p>
          Base URL:
          <code>/api/v1</code>
        </p>

        <h2>Auth Routes</h2>

        <pre>
POST /auth/register
POST /auth/login
GET  /auth/me
        </pre>

        <h2>Project Routes</h2>

        <pre>
GET    /projects
POST   /projects
GET    /projects/:id
PUT    /projects/:id
DELETE /projects/:id
        </pre>

        <h2>Task Routes</h2>

        <pre>
GET    /projects/:projectId/tasks
POST   /projects/:projectId/tasks
PUT    /projects/:projectId/tasks/:id
DELETE /projects/:projectId/tasks/:id
        </pre>

        <h2>Dashboard</h2>

        <pre>
GET /dashboard
        </pre>

      </body>
    </html>
  `);
});

/* ─────────────────────────────────────────────────────────────
   Error Handler
───────────────────────────────────────────────────────────── */

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors,
    });
  }

  const status = err.status || 500;

  res.status(status).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
  });
});

export default app;