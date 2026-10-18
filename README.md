# AI-Powered Support Ticket System

A full-stack help desk where customers raise support tickets and agents resolve them —
with **Google Gemini AI** automatically classifying every ticket by category and priority.

---

## Why it stands out

- **AI that does the triage** — new tickets are instantly categorised and prioritised.
- **Three-role workflows** — customers, agents and admins each get a tailored experience.
- **Admin controls the desk** — admins create agents and assign tickets to them.
- **Agent assignment & activity log** — tickets can be claimed, reassigned, and every
  change is tracked on a timeline.
- **Analytics dashboard** — resolution rate, volume by status/priority/category and a
  7-day trend.
- **Search, sort & pagination** — built for real ticket volumes.
- **Production-minded** — JWT auth, security headers, rate limiting, request validation,
  interactive API docs and automated tests.

---

## Feature Highlights

| Customer                       | Agent                                    | Admin                                          |
| ------------------------------ | ---------------------------------------- | ---------------------------------------------- |
| Register / log in              | See tickets assigned to them             | Everything agents can do                       |
| Create tickets (AI-classified) | Move their tickets through the workflow  | See every ticket across the desk               |
| Track status and updates       | Claim unassigned tickets                 | Create agent accounts                          |
| Comment on their tickets       | Comment and view the activity timeline   | Assign / reassign tickets to any agent         |
| See an activity timeline       | Analytics for their workload             | Full-desk analytics and agent management        |

---

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React (Vite) · Tailwind CSS · React Router    |
| Backend  | Node.js · Express                             |
| Database | MongoDB · Mongoose                            |
| Auth     | JWT · bcrypt                                   |
| AI       | Google Gemini (`gemini-3.5-flash-lite`)       |
| Tooling  | Helmet · express-validator · Swagger · node:test |

---

## Quick Start

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env          # add MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed                  # demo accounts + sample tickets
npm run dev                   # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm run dev                   # http://localhost:5173
```

**API docs:** `http://localhost:5000/api-docs` · **Tests:** `cd backend && npm test`

---

## Demo Accounts

Created by `npm run seed` — development-only.

| Role     | Email                   | Password |
| -------- | ----------------------- | -------- |
| Admin    | `admin@example.com`     | `123456` |
| Customer | `customer@example.com`  | `123456` |
| Agent    | `agent@example.com`     | `123456` |

---

## How the roles work

- **Customer** — creates tickets and follows their progress.
- **Agent** — sees **only tickets assigned to them**, can claim unassigned tickets, and
  moves their tickets through the status workflow.
- **Admin** — sees **all tickets**, can assign them to any agent, and manages agent
  accounts from the **Agents** page.

New agents are created by an admin (there is no public agent signup).

---

## Environment Variables

| Backend (`backend/.env`) | Frontend (`frontend/.env`) |
| ------------------------ | -------------------------- |
| `MONGODB_URI`            | `VITE_API_URL`             |
| `JWT_SECRET`             |                            |
| `GEMINI_API_KEY`         |                            |
| `GEMINI_MODEL`           |                            |
| `FRONTEND_URL`           |                            |
| `PORT`                   |                            |

---

## Project Structure

```
support-ticket-system/
├── backend/     # Express API, models, AI service, tests, Swagger spec
├── frontend/    # React + Tailwind single-page app
├── docker-compose.yml   # optional local MongoDB
└── README.md
```

Full endpoint reference lives in Swagger at `/api-docs`.

---

## License

MIT — see [LICENSE](./LICENSE).
