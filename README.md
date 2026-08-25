# Support Ticket & SLA Tracker

A full-stack support ticket management system built with **Bun, TypeScript, GraphQL, PostgreSQL, Prisma, React, and Vite**.

The application enables users to raise and track support requests while providing support agents with a centralized workspace to manage tickets, responses, ownership, status transitions, and SLA deadlines.

---

## Features

### User / Reporter

- Create a new account and securely sign in
- Create support tickets with title, description, and priority
- View only tickets created by the logged-in user
- Track ticket status and SLA progress
- View agent responses and ticket conversations
- Add comments to owned tickets
- View first-response and resolution deadlines
- Access personalized dashboard statistics

### Support Agent

- Dedicated Agent login
- View tickets across all reporters
- View complete ticket information
- Assign tickets to an agent
- Add responses and comments
- Move tickets through their lifecycle
- Resolve support requests
- Monitor first-response and resolution SLA health
- View SLA breaches and at-risk tickets

---

## Role-Based Authorization

The application implements server-side authorization to protect ticket data.

A **Reporter** can:

- View only their own tickets
- Open only their own tickets
- Comment only on their own tickets
- View dashboard statistics calculated only from their tickets

An **Agent** can:

- View tickets from all reporters
- Access ticket details
- Respond to tickets
- Assign tickets
- Update ticket status
- Resolve tickets

Authorization is enforced by the backend rather than relying only on frontend visibility.

---

## SLA Engine

The project contains a business-hours-aware SLA calculation engine.

SLA deadlines account for:

- Business working hours
- Tickets created before business hours
- Tickets created after business hours
- Weekends
- Configured public holidays
- SLA windows spanning multiple business days
- First-response SLA
- Resolution SLA

SLA health is represented using:

- `ON_TRACK`
- `AT_RISK`
- `BREACHED`
- `MET`

Tickets become **At Risk** after more than 75% of their available SLA time has been consumed.

---

## Ticket Lifecycle

Tickets follow controlled status transitions:

```text
OPEN
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED
```

Invalid status transitions are rejected by backend business rules.

---

## Tech Stack

### Backend

- Bun
- TypeScript
- GraphQL Yoga
- Prisma ORM
- PostgreSQL
- JWT Authentication

### Frontend

- React
- TypeScript
- Vite
- React Router
- Lucide React

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL

### Testing

- Bun Test
- Unit Tests
- Integration Tests
- Real PostgreSQL integration testing

---

## Project Structure

```text
support-ticket-sla-tracker/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── db/
│   │   ├── graphql/
│   │   ├── services/
│   │   └── validation/
│   └── tests/
│       ├── integration/
│       └── unit/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

Install:

- Node.js
- Bun
- Docker Desktop

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd support-ticket-sla-tracker
```

---

## 2. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

---

## 3. Configure Environment Variables

Create:

```text
backend/.env
```

Use `.env.example` as the reference.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/support_tracker?schema=public"
JWT_SECRET="replace-with-a-secure-secret"
PORT=4000
```

Never commit the real `.env` file.

---

## 4. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 5. Prepare the Database

Run the Prisma migrations:

```bash
npx prisma migrate deploy
```

Seed the development database if required:

```bash
npx prisma db seed
```

---

## 6. Start the Backend

```bash
bun run src/server.ts
```

The GraphQL API is available at:

```text
http://localhost:4000/graphql
```

GraphQL Yoga also provides GraphiQL for API testing.

---

## 7. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## Testing

### Backend Type Check

```bash
cd backend
npx tsc --noEmit
```

### Backend Test Suite

```bash
bun test
```

Current test suite:

```text
25 tests passed
0 tests failed
```

The test suite covers:

- Reporter ticket isolation
- Unauthorized ticket access
- Unauthorized commenting
- Agent access across reporters
- Reporter-specific dashboard statistics
- PostgreSQL ticket flow
- First agent response
- Business-hours SLA calculations
- Weekend handling
- Holiday handling
- SLA risk calculation
- SLA breach calculation
- Resolution SLA
- Ticket status transitions
- Input validation

---

## Frontend Production Build

```bash
cd frontend
npm run build
```

The frontend is type-checked and compiled into a production-ready Vite build.

---

## Security

The project includes:

- JWT-based authentication
- Role-based authorization
- Server-side reporter ownership checks
- Protected ticket access
- Protected commenting
- Agent-specific operations
- Environment-variable based secrets
- `.env` exclusion through `.gitignore`

---

## Example Workflow

1. A user creates an account.
2. The user creates a support ticket.
3. The SLA engine calculates response and resolution deadlines.
4. A support agent views the ticket.
5. The agent assigns and responds to the ticket.
6. The first-response SLA is recorded.
7. The ticket moves to `IN_PROGRESS`.
8. The agent resolves the issue.
9. Resolution time and SLA status are recorded.
10. The reporter can view the completed ticket and conversation.

---

## Highlights

This project focuses on more than basic CRUD operations. It demonstrates:

- Real business-rule implementation
- Business-hours-aware time calculations
- Multi-user data isolation
- Role-based access control
- GraphQL API design
- Relational database persistence
- Full-stack TypeScript development
- Automated unit and integration testing
- Production frontend build validation

---

## License

This project was developed as a technical assignment and portfolio project.