# AI-Powered Support Ticket System

A full-stack help desk where customers raise support tickets and agents resolve them —
with **Google Gemini AI** automatically classifying every ticket by category and priority.

Built as a Full Stack Developer assessment for **NT Tech Innovation**.

---

## Why it stands out

- **AI that does the triage** — new tickets are instantly categorised and prioritised.
- **Real role-based workflows** — separate customer and agent experiences.
- **Agent assignment & activity log** — tickets can be claimed, reassigned, and every
  change is tracked on a timeline.
- **Analytics dashboard** — resolution rate, volume by status/priority/category and a
  7-day trend.
- **Search, sort & pagination** — built for real ticket volumes.
- **Production-minded** — JWT auth, security headers, rate limiting, request validation,
  interactive API docs and automated tests.

---

## Feature Highlights

| Customer                        | Agent                                    |
| ------------------------------- | ---------------------------------------- |
| Register / log in               | Everything a customer can do             |
| Create tickets (AI-classified)  | View every ticket across the desk        |
| Track status and read updates   | Assign / reassign tickets to agents      |
| Comment on their tickets        | Move tickets through the status workflow |
| See a clear activity timeline   | Analytics dashboard                      |

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
| Customer | `customer@example.com`  | `123456` |
| Agent    | `agent@example.com`     | `123456` |

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
