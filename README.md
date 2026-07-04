# LeetCode Tracker & AI Insights Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-%3E%3D%205.0.0-blue)](https://vitejs.dev/)

A premium analytics and productivity dashboard built on the MERN stack (utilizing MySQL for user isolation, Express, React, and Node.js) with custom AI insights generated algorithmically from public LeetCode profiles. Track local progress, analyze contest ratings, and forecast future practice metrics.

---

## 📸 Screenshots

| Dashboard Overview | AI Analytics & Predictions |
| --- | --- |
| ![Dashboard Overview](https://via.placeholder.com/600x400?text=Dashboard+Overview+Placeholder) | ![AI Analytics](https://via.placeholder.com/600x400?text=AI+Insights+Placeholder) |

---

## 🏗️ Architecture

The application is structured into a client-server architecture with secure API communication and isolated user database sessions.

```
                    ┌────────────────────────┐
                    │     React Frontend     │
                    └───────────┬────────────┘
                                │ JWT Auth Bearer Headers
                                ▼
                    ┌────────────────────────┐
                    │     Express Server     │
                    └─────┬────────────┬─────┘
                          │            │
            MySQL Database│            │External API queries
            (Isolated by  │            │(With Cache + Retry)
             user_id)     ▼            ▼
                ┌───────────┐   ┌───────────────────────────┐
                │   Users   │   │   alfa-leetcode-api       │
                │ & Problems│   │ (Profile, Solved, Contest)│
                └───────────┘   └───────────────────────────┘
```

---

## ✨ Features

- **📊 Unified Analytics Dashboard**: Track total solves, subcategories (Easy, Medium, Hard), acceptance rates, streaks, and ranking details.
- **🏆 Contest Performance**: Visualize rating curves, global ranks, participation rates, and percentile scores with clean fallback metrics.
- **🧠 AI Insights Engine**:
  - *Consistency Score*: Algorithmic evaluations (0-100) based on streaks and practice cadence.
  - *Interview Readiness*: Weighted evaluations based on topic coverage, difficulty balance, and contest rates.
  - *Milestone Target Predictions*: Estimates days/months needed to reach 100, 250, 500, and 1000 solved milestones.
  - *Personalized Learning Paths*: Custom suggestions mapped to your topic strength analysis.
- **📝 Local Problem Tracker (CRUD)**: Add, edit, and delete problems manually. Filter by difficulty, status, or categories.
- **🔄 Smart Sync & Submissions Import**: Auto-import accepted submissions from your connected LeetCode profile to update local trackers.
- **🛡️ Secure Isolation**: Parameterized SQL queries prevent injection. Token validations block cross-user operations.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, React Query, React Hot Toast, Heroicons.
- **Backend**: Node.js, Express, MySQL (via `mysql2`), JWT Authentication, CORS, Helmet, Express Rate Limit, Axios.
- **Services**: In-memory caching wrapper (5-minute TTL) & Exponential backoff retry handler for LeetCode API endpoints.

---

## 📂 Folder Structure

```
Leetcode-Tracker/
├── backend/
│   ├── config/            # MySQL Connection Pool configuration
│   ├── controllers/       # Route handlers (Problems, Users, LeetCode Sync, AI)
│   ├── middleware/        # JWT Authorization & Loggers
│   ├── routes/            # Express Routers
│   ├── services/          # Analytics scoring engine & LeetCode wrapper
│   └── server.js          # App entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Common widgets, cards, and navigation layouts
│   │   ├── hooks/         # TanStack Query custom hooks
│   │   ├── pages/         # Login, Register, Profile, Dashboard views
│   │   ├── api.js         # Base axios client with Bearer headers
│   │   └── main.jsx       # Client entry
│   └── index.html         # HTML Document template
├── .gitignore             # Root-level Git ignores (secrets, dependencies)
├── .env.example           # Shared environment configurations template
└── README.md              # Project documentation
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=leetcode_tracker
JWT_SECRET=your_jwt_signing_key_here
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory (optional - defaults to localhost port 5000 if omitted):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Running Locally

### 1. Prerequisites
- Node.js installed (v18+ recommended).
- MySQL Server installed and running.

### 2. Database Initialization
Create a MySQL database named `leetcode_tracker`. Run your migration queries to establish `users` and `problems` tables.

### 3. Installation
Clone the repository and install packages:
```bash
# Clone the repository
git clone https://github.com/yourusername/Leetcode-Tracker.git
cd Leetcode-Tracker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Running the Dev Servers
```bash
# In the backend directory
npm start # or node server.js

# In the frontend directory
npm run dev
```
Open your browser to the URL printed by Vite (typically `http://localhost:5173`).

---

## 🌐 Deployment

- **Backend**: Can be deployed to Heroku, Render, AWS EC2, or digital ocean droplets.
- **Frontend**: Can be built (`npm run build`) and deployed to static hosts like Netlify, Vercel, or GitHub Pages.
- **Database**: Can be hosted on Amazon RDS, PlanetScale, or shared server DB pools.

---

## 🔮 Future Improvements

- **Interactive IDE Integration**: Solve problems inside the tracker dashboard.
- **Automated Solutions Analysis**: Real-time code quality evaluation.
- **Friends Leadboards**: Compare practice pacing and consistency ratings against peer groups.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
