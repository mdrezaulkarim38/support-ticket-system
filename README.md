# AI-Powered Support Ticket System

A full-stack support ticket platform where customers create support tickets and agents
manage them. When a ticket is created, a Google Gemini AI service automatically suggests
the most suitable **category** and **priority** for it.

Built as a Full Stack Developer assessment for NT Tech Innovation.

---

## Features

- **Authentication** - register and log in with JWT; passwords hashed with bcrypt.
- **Role-based access** - `customer` and `agent` roles enforced on every route.
- **Ticket management** - create, list, view and update tickets.
- **AI classification** - Gemini suggests a category and priority for each new ticket.
- **Comments** - threaded conversation on each ticket between the customer and agents.
- **Status workflow** - validated transitions: `Open -> In Progress -> Resolved -> Closed`.
- **Search, sort & pagination** - server-side search across title/description, multiple
  sort orders (newest, oldest, recently updated, priority, title) and paged results.
- **Agent assignment** - agents can claim or reassign tickets to any agent.
- **Activity log** - every ticket records an immutable timeline (created, assigned,
  reassigned, unassigned, status changed).
- **Analytics dashboard** - agents get counts by status/priority/category, a resolution
  rate and a 7-day creation trend.
- **Security hardening** - Helmet security headers, per-route rate limiting and
  server-side request validation.
- **API docs** - interactive Swagger UI at `/api-docs`.
- **Automated tests** - API integration tests with the Node test runner.
- **Seed data** - one command creates demo accounts and sample tickets.

---

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React (Vite) + Tailwind CSS + React Router    |
| Backend  | Node.js + Express                             |
| Database | MongoDB + Mongoose                            |
| Auth     | JWT (jsonwebtoken) + bcryptjs                  |
| AI       | Google Gemini API (`gemini-3.5-flash-lite`)   |

---

## Project Structure

```
support-ticket-system/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Mongoose connection
│   │   └── swagger.js            # OpenAPI spec + Swagger UI
│   ├── controllers/
│   │   ├── authController.js     # register / login
│   │   ├── ticketController.js   # ticket CRUD, search, stats, workflow
│   │   ├── commentController.js  # add / list comments
│   │   └── userController.js     # agent directory
│   ├── middleware/
│   │   ├── authMiddleware.js     # verifies JWT, sets req.user
│   │   ├── roleMiddleware.js     # requireRole("agent") guards
│   │   ├── rateLimiters.js       # general + auth rate limits
│   │   └── validators.js         # express-validator rules
│   ├── models/
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   ├── Comment.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── commentRoutes.js
│   │   └── userRoutes.js
│   ├── tests/                    # node:test + supertest API tests
│   ├── utils/
│   │   ├── aiService.js          # Gemini classification + fallback
│   │   └── activity.js           # activity log helper
│   ├── .env.example
│   ├── app.js                    # express app (middleware + routes)
│   ├── seed.js                   # demo accounts + sample tickets
│   ├── server.js                 # connects DB and starts the server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/api.js
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml            # local MongoDB (optional)
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A MongoDB database (local MongoDB / Docker, or MongoDB Atlas)
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone

```bash
git clone https://github.com/mdrezaulkarim38/support-ticket-system.git
cd support-ticket-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env and fill in MONGODB_URI, JWT_SECRET and GEMINI_API_KEY
```

Start a local MongoDB (optional, if you are not using Atlas):

```bash
# from the repository root
docker compose up -d
```

Seed demo data and run the API:

```bash
npm run seed    # creates demo accounts + sample tickets
npm run dev     # http://localhost:5000
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env    # set VITE_API_URL=http://localhost:5000
npm run dev             # http://localhost:5173
```

Open http://localhost:5173 and log in with one of the demo accounts below.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Description                                        |
| ---------------- | -------------------------------------------------- |
| `PORT`           | Port the API listens on (default `5000`)           |
| `MONGODB_URI`    | MongoDB connection string                          |
| `JWT_SECRET`     | Secret used to sign JWTs                           |
| `GEMINI_API_KEY` | Google Gemini API key                              |
| `GEMINI_MODEL`   | Gemini model name (default `gemini-3.5-flash-lite`)|
| `FRONTEND_URL`   | Allowed CORS origin (default `http://localhost:5173`) |

### Frontend (`frontend/.env`)

| Variable       | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Base URL of the API  |

---

## Demo Credentials

Created by `npm run seed`. These are **development-only** accounts.

```
Customer Account
  Email:    customer@example.com
  Password: 123456

Agent Account
  Email:    agent@example.com
  Password: 123456
```

---

## API Reference

All ticket, comment and user routes require an `Authorization: Bearer <token>` header.
An interactive version of this reference is served at **`/api-docs`** (Swagger UI).

### Auth

| Method | Endpoint             | Description           | Access |
| ------ | -------------------- | --------------------- | ------ |
| POST   | `/api/auth/register` | Register a customer   | Public |
| POST   | `/api/auth/login`    | Log in, returns JWT   | Public |
| GET    | `/api/auth/me`       | Current user          | Any    |

### Tickets

| Method | Endpoint                     | Description                          | Access         |
| ------ | ---------------------------- | ------------------------------------ | -------------- |
| POST   | `/api/tickets`               | Create a ticket (+ AI analysis)      | Customer       |
| GET    | `/api/tickets`               | List tickets (own or all)            | Customer/Agent |
| GET    | `/api/tickets/stats`         | Aggregated ticket statistics         | Customer/Agent |
| GET    | `/api/tickets/:id`           | Get a single ticket                  | Owner/Agent    |
| PATCH  | `/api/tickets/:id/status`    | Update ticket status                 | Agent only     |
| PATCH  | `/api/tickets/:id/assign`    | Assign / unassign an agent           | Agent only     |
| GET    | `/api/tickets/:id/activity`  | Activity timeline for a ticket       | Owner/Agent    |

`GET /api/tickets` accepts query parameters:

| Param      | Values                                                     | Default  |
| ---------- | ---------------------------------------------------------- | -------- |
| `q`        | search text matched against title/description              | -        |
| `status`   | `Open`, `In Progress`, `Resolved`, `Closed`                | all      |
| `priority` | `Low`, `Medium`, `High`, `Urgent`                          | all      |
| `category` | category name                                              | all      |
| `sort`     | `newest`, `oldest`, `updated`, `priority`, `title`         | `newest` |
| `page`     | page number                                                | `1`      |
| `limit`    | page size (max 100)                                        | `10`     |

The response is paginated: `{ items, total, page, limit, pages }`.

For `PATCH /api/tickets/:id/assign`, send `{ "assignedTo": "<agentId>" }`, send
`{ "assignedTo": null }` to unassign, or omit the body to assign the ticket to yourself.

### Comments

| Method | Endpoint                     | Description       | Access         |
| ------ | ---------------------------- | ----------------- | -------------- |
| POST   | `/api/tickets/:id/comments`  | Add a comment     | Owner/Agent    |
| GET    | `/api/tickets/:id/comments`  | List comments     | Owner/Agent    |

### Users

| Method | Endpoint            | Description          | Access     |
| ------ | ------------------- | -------------------- | ---------- |
| GET    | `/api/users/agents` | List all agents      | Agent only |

### Misc

| Method | Endpoint        | Description            | Access |
| ------ | --------------- | ---------------------- | ------ |
| GET    | `/api/health`   | Health check           | Public |
| GET    | `/api-docs`     | Swagger UI             | Public |

---

## Security

- **Helmet** sets secure HTTP headers on every response.
- **Rate limiting** - a general limiter on `/api` and a stricter limiter on `/api/auth`
  (disabled automatically when `NODE_ENV=test`).
- **Validation** - every write endpoint is validated with `express-validator`, returning
  structured `400` errors before reaching the controller.
- **Auth** - JWTs signed with `JWT_SECRET`; passwords hashed with bcrypt and never returned.
- **Secrets** - `.env` is gitignored; `.env.example` documents the required variables.

---

## Testing

The backend ships with integration tests powered by the built-in Node test runner,
`supertest` and an in-memory MongoDB (no external database or Gemini key required).

```bash
cd backend
npm test
```

Coverage includes authentication and validation, ticket creation and AI fallback,
role-based access, status transitions, assignment, the activity log, pagination/search,
tenant isolation and the stats endpoint.

---

## AI Feature

**Input:** the ticket `title` and `description`.

**Process** (`backend/utils/aiService.js`):

1. The title and description are inserted into a classification prompt.
2. Gemini is asked to return **only** a JSON object:
   ```json
   { "category": "Billing", "priority": "High" }
   ```
3. The response is cleaned (markdown fences removed) and parsed.
4. The returned values are validated against the allowed enums.

**Output:** a `category` (`Technical`, `Billing`, `Account`, `Feature Request`, `General`)
and a `priority` (`Low`, `Medium`, `High`, `Urgent`). The result is stored on the ticket
in `category`/`priority` and also recorded in `aiSuggestedCategory`/`aiSuggestedPriority`.

**Limitations:**

- The AI is a suggestion only; agents can change the status, not the category/priority.
- Short or vague tickets may be misclassified.
- If the API key is missing or the request fails, the service falls back to
  `General` / `Medium` so ticket creation never breaks.
- Free-tier Gemini quotas apply (per project, reset daily).

---

## Database Schema

**User**

| Field      | Type   | Notes                                     |
| ---------- | ------ | ----------------------------------------- |
| name       | String | required                                  |
| email      | String | required, unique, lowercased              |
| password   | String | required, bcrypt-hashed, not returned     |
| role       | String | `customer` or `agent` (default customer)  |
| timestamps | Date   | `createdAt`, `updatedAt`                  |

**Ticket**

| Field                 | Type     | Notes                                              |
| --------------------- | -------- | -------------------------------------------------- |
| title                 | String   | required                                           |
| description           | String   | required                                           |
| status                | String   | `Open`, `In Progress`, `Resolved`, `Closed`        |
| priority              | String   | `Low`, `Medium`, `High`, `Urgent`                  |
| category              | String   | AI-classified                                      |
| aiSuggestedCategory   | String   | raw AI suggestion                                  |
| aiSuggestedPriority   | String   | raw AI suggestion                                  |
| createdBy             | ObjectId | ref `User`                                         |
| assignedTo            | ObjectId | ref `User` (optional)                              |
| timestamps            | Date     | `createdAt`, `updatedAt`                           |

**Comment**

| Field      | Type     | Notes             |
| ---------- | -------- | ----------------- |
| ticket     | ObjectId | ref `Ticket`      |
| user       | ObjectId | ref `User`        |
| message    | String   | required          |
| timestamps | Date     | `createdAt`       |

**Activity**

| Field      | Type     | Notes                                                        |
| ---------- | -------- | ------------------------------------------------------------ |
| ticket     | ObjectId | ref `Ticket`                                                 |
| actor      | ObjectId | ref `User` who performed the action                          |
| action     | String   | `created`, `assigned`, `reassigned`, `unassigned`, `status_changed` |
| meta       | Mixed    | action-specific details (e.g. status from/to, assignee)      |
| timestamps | Date     | `createdAt`                                                  |

---

## Status Workflow

```
Open  ->  In Progress  ->  Resolved  ->  Closed
```

- Only agents can change a ticket's status.
- Transitions are validated: `Open -> {In Progress, Closed}`,
  `In Progress -> {Resolved, Closed}`, `Resolved -> Closed`, `Closed -> (none)`.
- Invalid transitions and repeated status changes are rejected with `400`.

---

## Known Limitations

- Agents are provisioned via the seed script; there is no public agent signup.
- No file attachments, notifications, or real-time updates.
- Ticket `category` and `priority` are not editable by agents (AI suggestion only).
- Free-tier Gemini quota can be exhausted, in which case the fallback values are used.

---

## Deployment (optional)

**Backend -> Render**
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add all environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `FRONTEND_URL`).

**Frontend -> Vercel**
- Root directory: `frontend`
- Framework preset: Vite
- Environment variable: `VITE_API_URL` = your Render backend URL.

**Database -> MongoDB Atlas** (free tier)

---

## License

MIT - see [LICENSE](./LICENSE).
