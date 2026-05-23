# ⬡ TaskFlow — Team Task Management Application

> A full-stack collaborative project and task management platform where teams create projects, assign tasks, track progress, and ship work — together.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend | `https://taskflow-frontend.up.railway.app` |
| ⚙️ Backend API | `https://taskflow-backend.up.railway.app/api` |

> **Demo credentials**
> Admin → `admin@taskflow.com` / `admin123`
> Member → `member@taskflow.com` / `member123`

---

## 📌 What is TaskFlow?

TaskFlow is a simplified but production-ready alternative to tools like Trello and Asana. It is built for small teams who need a clean, fast, and role-aware way to manage their work without the bloat.

A user signs up, creates a project, and instantly becomes its Admin. They invite teammates, assign tasks with priorities and due dates, and track everything through a live Kanban board. Admins control the board; Members move their own cards. A real-time dashboard shows every metric that matters — total tasks, progress by status, workload per person, and overdue warnings.

Everything is enforced on the backend. Hiding a button is not security — every restricted API route requires a valid JWT and checks the caller's role before responding.

---

## ✨ Features

### 🔐 Authentication
- Secure signup and login with hashed passwords (bcrypt)
- JWT-based session — token stored in localStorage, sent on every request
- Role assignment at registration — Member by default, Admin via promotion

### 📁 Project Management
- Create projects in one click — creator auto-assigned as Admin
- Admin can add or remove members from a project
- Members can only view projects they belong to
- Each project is fully isolated — tasks, members, and permissions are scoped per project

### ✅ Task Management — Kanban Board
- Three-column board: **To Do → In Progress → Done**
- Quick-move buttons on every card — no drag needed
- Full task details: Title, Description, Priority (Low / Medium / High), Due Date, Assignee, Status
- Overdue tasks highlighted in red automatically
- Admin-only: create, edit, and delete tasks

### 📊 Dashboard
- Total task count across all projects
- Breakdown by status (To Do / In Progress / Done)
- Task count per team member
- Overdue task list with assignee and due date

### 🛡️ Role-Based Access Control
| Action | Admin | Member |
|---|---|---|
| Create / edit / delete tasks | ✅ | ❌ |
| Add / remove project members | ✅ | ❌ |
| Move task status | ✅ | ✅ |
| View dashboard | ✅ | ✅ |
| Access Admin panel | ✅ | ❌ |

> Role is enforced at the API level — not just the UI. Every protected endpoint validates the JWT and checks role before executing.

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Routing | State-based (no external router) |
| Styling | Inline styles with design tokens — zero CSS frameworks |
| HTTP | Native `fetch` API with a custom `api()` wrapper |
| Auth | JWT stored in localStorage |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Atlas) via Mongoose |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Validation | Express-validator / manual middleware |

### Infrastructure
| Service | Provider |
|---|---|
| Frontend hosting | Railway |
| Backend hosting | Railway |
| Database | MongoDB Atlas (M0 free tier) |
| Environment config | Railway environment variables |

---

## 🗂️ Project Structure

```
taskflow/
│
├── backend/
│   ├── controllers/         # Route logic (auth, projects, tasks, dashboard, admin)
│   ├── middleware/          # JWT auth, role guards
│   ├── models/              # Mongoose schemas (User, Project, Task)
│   ├── routes/              # Express routers
│   ├── .env.example         # Environment variable template
│   └── server.js            # App entry point
│
└── frontend/
    └── src/
        ├── api/
        │   └── client.js        # fetch wrapper + localStorage util
        ├── utils/
        │   └── toast.js         # Toast notification singleton
        ├── constants/
        │   └── index.js         # STATUS, PRIORITY, shared styles
        ├── styles/
        │   └── global.js        # Global CSS string
        ├── components/
        │   ├── ui/              # Btn, Badge, Card, Avatar, Spinner, FormFields, ToastContainer
        │   └── layout/          # Sidebar, PageLayout helpers
        ├── pages/
        │   ├── AuthPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProjectsPage.jsx
        │   ├── TasksPage.jsx
        │   ├── KanbanColumn.jsx
        │   └── AdminPage.jsx
        ├── App.jsx              # Auth state + page routing
        └── main.jsx             # Entry point only (4 lines)
```

---

## 🗃️ Database Design

### User
```
_id, name, email, password (hashed), role (admin | member), createdAt
```

### Project
```
_id, name, description, createdBy (→ User),
members: [{ user (→ User), role (admin | member) }],
createdAt
```

### Task
```
_id, title, description, priority (low | medium | high),
status (todo | in_progress | done),
dueDate, assignedTo (→ User), projectId (→ Project),
createdBy (→ User), createdAt
```

Relationships are maintained via Mongoose `ref` and `populate()`. Dashboard aggregations run as server-side queries — not computed on the client.

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
```

Start backend:
```bash
npm start
# Running on http://localhost:5000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
# Running on http://localhost:5173
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api` | Public | Create account |
| POST | `/api/v1/auth/login` | Public | Login, returns JWT |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/projects` | Auth | List your projects |
| POST | `/api/v1/projects` | Auth | Create project |
| GET | `/api/v1/projects/:id` | Member | Get project details |
| POST | `/api/v1/projects/:id/members` | Admin | Add member |
| DELETE | `/api/v1/projects/:id/members/:uid` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/projects/:id/tasks` | Member | List tasks |
| POST | `/api/v1/projects/:id/tasks` | Admin | Create task |
| PUT | `/api/v1/projects/:id/tasks/:tid` | Admin + Member | Update task / move status |
| DELETE | `/api/v1/projects/:id/tasks/:tid` | Admin | Delete task |

### Dashboard & Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard` | Auth | Aggregated stats |
| GET | `/api/v1/admin/users` | Admin | All users |
| GET | `/api/v1/admin/tasks` | Admin | All tasks across projects |

---

## ☁️ Deployment (Railway)

Both frontend and backend are deployed as separate services on Railway, connected to MongoDB Atlas.

### Backend environment variables
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
PORT=5000
NODE_ENV=production
```

### Frontend environment variables
```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

### CORS
Backend explicitly allows the Railway frontend domain:
```js
app.use(cors({
  origin: ['http://localhost:5173', 'https://taskflow-frontend.up.railway.app'],
  credentials: true
}));
```

Full Railway deployment steps are documented in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## 📸 Screenshots

| Dashboard | Kanban Board |
|---|---|
| Stats, overdue tasks, member workload | Three-column board with quick-move actions |

| Projects | Admin Panel |
|---|---|
| Create projects, manage members | View all users and tasks site-wide |

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (10 salt rounds) — never stored in plain text
- JWT signed with a secret key, verified on every protected request
- Role checks happen in backend middleware — frontend UI state cannot bypass them
- MongoDB Atlas IP whitelist set to `0.0.0.0/0` for Railway (dynamic IPs) — can be restricted to specific Railway IP ranges in production
- Environment variables used for all secrets — no hardcoded credentials anywhere

---

## 🧠 Design Decisions

**Why no external UI library?**
The entire UI is built with inline styles and a small set of custom components (Btn, Card, Badge, etc.). This keeps the bundle small, avoids version conflicts, and gives full control over every pixel.

**Why state-based routing instead of React Router?**
The app has four pages. A `page` state variable with conditional rendering is simpler, faster to load, and easier to understand than installing and configuring a full router for four routes.

**Why JWT in localStorage instead of cookies?**
This is a team-internal tool without third-party script risk. For a public-facing product, httpOnly cookies would be preferred.

---

## 👨‍💻 Author

Built as part of a full-stack development assignment — designed, developed, and deployed end-to-end as a solo project.

---

## 📄 License

MIT — free to use, modify, and distribute.