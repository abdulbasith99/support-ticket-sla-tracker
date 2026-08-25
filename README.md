# Support Ticket & SLA Tracker

A full-stack Support Ticket and SLA (Service Level Agreement) Tracker built with **Bun, TypeScript, GraphQL Yoga, PostgreSQL, Prisma, React, and Vite**.

The application allows reporters to raise and track support tickets while support agents can manage the support queue, assign tickets, respond to users, update ticket status, and resolve issues.

The core of the application is a **backend-driven SLA engine** that calculates first-response and resolution deadlines using business hours rather than normal wall-clock time.

---

## Features

### Reporter

- Register and securely sign in
- Create support tickets
- Select ticket priority
- View only tickets created by the authenticated reporter
- View personal dashboard statistics
- View ticket details
- Track ticket status
- Track first-response and resolution SLA
- View remaining SLA time
- View ticket conversations
- Add comments to owned tickets
- View resolved tickets

### Support Agent

- Secure Agent login
- View tickets from all reporters
- Filter and sort the support queue
- View complete ticket details
- Assign tickets
- Add responses and comments
- Move tickets through their lifecycle
- Resolve tickets
- Monitor first-response SLA
- Monitor resolution SLA
- View On Track, At Risk, Breached, and Met SLA states
- View dashboard statistics across the support queue

---

## Tech Stack

### Backend

- Bun
- TypeScript
- GraphQL Yoga
- Prisma ORM
- PostgreSQL
- JWT authentication

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
- Unit tests
- Integration tests
- Real PostgreSQL integration testing

---

## Architecture Overview

The application is separated into a React frontend, GraphQL backend, business-service layer, and PostgreSQL persistence layer.

```text
React + TypeScript Frontend
            |
            | GraphQL
            v
GraphQL Yoga API
            |
            v
Authentication / Validation / Authorization
            |
            v
Ticket Service + SLA Service
            |
            v
Prisma ORM
            |
            v
PostgreSQL
```

### Frontend Responsibilities

The frontend handles:

- User interface
- Navigation
- Authentication state
- Ticket creation forms
- Ticket lists and filters
- Ticket details
- Comments
- Dashboard presentation
- Displaying SLA information returned by the backend

The frontend does **not** independently calculate whether an SLA is On Track, At Risk, or Breached.

### Backend Responsibilities

The backend is the source of truth for:

- Authentication
- Authorization
- Validation
- Ticket ownership
- Ticket lifecycle rules
- Assignment
- Comment handling
- First-response recording
- SLA calculations
- Business-hour calculations
- Holiday exclusion
- Database persistence

Business logic is separated from GraphQL resolvers so that SLA and ticket rules remain independently testable.

---

## Project Structure

```text
support-ticket-sla-tracker/
|
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   |
│   ├── src/
│   │   ├── db/
│   │   ├── graphql/
│   │   │   ├── resolvers/
│   │   │   └── schema/
│   │   ├── services/
│   │   │   ├── auth/
│   │   │   ├── sla/
│   │   │   └── ticket/
│   │   ├── validation/
│   │   ├── auth.ts
│   │   └── server.ts
│   |
│   └── tests/
│       ├── integration/
│       └── unit/
|
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── utils/
|
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Database Schema Overview

PostgreSQL is used as the relational database and Prisma ORM manages the schema, relations, constraints, indexes, and migrations.

The application contains four core models.

### User

Stores authenticated application users.

Important fields include:

- `id`
- `name`
- `email`
- password hash
- `role`
- creation timestamp

Supported roles:

```text
REPORTER
AGENT
```

A User can report tickets, be assigned tickets, and author comments depending on their role.

### Ticket

Stores the support request and its SLA-related timestamps.

Important fields include:

- `id`
- `title`
- `description`
- `priority`
- `status`
- `reporter`
- optional `assignee`
- `createdAt`
- `firstResponseAt`
- `resolvedAt`

Ticket relationships connect the ticket to its reporter, optional assignee, and comments.

### Comment

Stores messages in the ticket conversation.

Each comment:

- belongs to one ticket
- has an author
- contains message content
- records its creation timestamp

The first comment made by an Agent records the ticket's `firstResponseAt` timestamp.

Reporter comments do not trigger the first-response event.

### Holiday

Stores configured non-working public holidays.

Important fields include:

- `id`
- `date`
- `name`

Configured holidays contribute **zero business time** to SLA calculations.

---

## Authentication & Authorization

The application supports two roles:

```text
REPORTER
AGENT
```

Authentication uses JWT-based sessions.

Passwords are stored using secure password hashing and are never stored as plain text.

### Reporter Authorization

A Reporter can:

- Create tickets
- View only their own tickets
- Open only their own tickets
- Comment only on their own tickets
- View dashboard statistics calculated from their own tickets

A Reporter cannot access or modify another reporter's ticket.

### Agent Authorization

An Agent can:

- View tickets from all reporters
- Open any support ticket
- Assign tickets
- Add Agent responses
- Change ticket status
- Resolve tickets

Authorization is enforced **server-side**, not only through frontend visibility.

Public registration is restricted to Reporter accounts.

---

## Ticket Priority

Supported priorities are:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

## Ticket Status Lifecycle

Tickets follow controlled lifecycle transitions.

```text
OPEN
  |
  v
IN_PROGRESS
  |
  v
RESOLVED
  |
  v
CLOSED
```

Invalid transitions are rejected by backend business rules.

For example:

```text
CLOSED -> IN_PROGRESS
```

is not permitted directly.

Invalid transitions return a meaningful GraphQL error instead of an unhandled server error.

---

# SLA Engine

The SLA engine is the main business-logic component of the project.

All SLA calculations happen on the backend.

SLA time is measured using **business time**, not normal elapsed wall-clock time.

---

## Default SLA Policies

| Priority | First Response | Resolution |
|---|---:|---:|
| URGENT | 1 business hour | 4 business hours |
| HIGH | 4 business hours | 24 business hours |
| MEDIUM | 8 business hours | 48 business hours |
| LOW | 24 business hours | 72 business hours |

---

## Business Hours

Configured business hours are:

```text
Monday - Friday
09:00 - 18:00
```

This provides:

```text
9 business hours per working day
```

The following periods contribute **zero SLA time**:

- Before 09:00
- After 18:00
- Saturday
- Sunday
- Configured public holidays

---

## Business Timezone

Business-hour calculations use a configured timezone.

Default configuration:

```env
BUSINESS_TIMEZONE="Asia/Kolkata"
```

Database timestamps are stored in UTC.

The API returns unambiguous timestamps and the frontend formats timestamps using the user's local timezone.

---

## SLA Due Times

For every ticket, the backend calculates:

- First-response due time
- Resolution due time
- First-response SLA state
- Resolution SLA state
- First-response remaining business minutes
- Resolution remaining business minutes

The frontend only displays these backend-calculated values.

---

## SLA States

Active SLA clocks can be:

```text
ON_TRACK
AT_RISK
BREACHED
```

Completed SLA clocks are displayed as:

```text
MET
```

### ON_TRACK

Between 0% and 75% of the SLA budget has been consumed.

### AT_RISK

More than 75% of the SLA budget has been consumed.

The exact 75% boundary remains:

```text
ON_TRACK
```

### BREACHED

The SLA deadline has passed before the required SLA event occurred.

### MET

The required SLA event occurred within its deadline.

---

## Business-Hours Examples

### Ticket Created Before Business Hours

```text
Created:
Monday 07:00

SLA starts:
Monday 09:00
```

### Ticket Created After Business Hours

```text
Created:
Monday 20:00

SLA starts:
Tuesday 09:00
```

### Weekend

A ticket created on Saturday or Sunday begins consuming SLA time from the next valid business period.

### Friday Evening

If a ticket is created late Friday, only the remaining Friday business time is consumed.

The rest continues on the next valid business day.

### Public Holiday

If Monday is configured as a holiday:

```text
Friday
   |
Saturday -> 0 business time
   |
Sunday -> 0 business time
   |
Monday Holiday -> 0 business time
   |
Tuesday 09:00 -> SLA continues
```

---

## Example SLA Calculation

Consider an URGENT ticket created at:

```text
Tuesday 17:24
```

The first-response target is one business hour.

Business time available Tuesday:

```text
17:24 -> 18:00 = 36 minutes
```

The remaining 24 minutes continue on Wednesday:

```text
Wednesday 09:00 -> 09:24
```

Therefore:

```text
First response due:
Wednesday 09:24
```

The four-business-hour resolution SLA similarly continues through valid business periods rather than simply adding four wall-clock hours.

---

## SLA Clock Freezing

SLA clocks stop when the corresponding event occurs.

### First Response

Reporter comments do not count as the first Agent response.

Example:

```text
Reporter -> Comment
Reporter -> Comment
Reporter -> Comment
Agent    -> Comment  <- First response
```

When the first Agent comment is created:

```text
firstResponseAt
```

is recorded.

Subsequent Agent comments do not change this timestamp.

Once the first-response SLA is completed, it cannot later become Breached simply because the ticket remains open.

### Resolution

When a ticket is resolved:

```text
resolvedAt
```

is recorded.

The resolution SLA is then frozen using the actual resolution timestamp.

---

## Holiday Calendar

The project contains a configurable Holiday model and seed data with a sample public holiday.

The SLA engine checks configured holidays while calculating business time.

A configured holiday contributes zero business minutes.

---

## Validation & Error Handling

Validation is enforced server-side.

Examples of rejected operations include:

- Empty ticket title
- Empty ticket description
- Invalid priority
- Empty comment
- Non-existent ticket
- Non-existent assignee
- Invalid ticket transition
- Unauthorized ticket access
- Unauthorized Agent operation

Business failures return meaningful GraphQL errors rather than uncontrolled HTTP 500 errors.

Example error codes include:

```text
VALIDATION_ERROR
TICKET_NOT_FOUND
USER_NOT_FOUND
UNAUTHORIZED
FORBIDDEN
INVALID_STATUS_TRANSITION
```

---

## Pagination & Filtering

Ticket listing supports cursor-based pagination.

Tickets can be filtered using:

- Status
- Priority
- Assignee
- SLA state

Pagination returns page information including:

```text
hasNextPage
endCursor
```

The frontend provides ticket filtering and sorting controls.

---

## Dashboard

The dashboard provides summary information such as:

- Open tickets
- In-progress tickets
- At-risk tickets
- Breached tickets

Reporter dashboard statistics are scoped to that authenticated reporter.

Agent dashboard statistics represent the support queue available to the Agent.

---

# Getting Started

## Prerequisites

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

Docker Compose starts the PostgreSQL database required by the application.

---

## 3. Configure Environment Variables

Create:

```text
backend/.env
```

Use the root `.env.example` as the template.

Example local configuration:

```env
DATABASE_URL="postgresql://burdenoff:burdenoff_password@localhost:5432/burdenoff_sla?schema=public"
JWT_SECRET="replace-with-a-secure-secret"
BUSINESS_TIMEZONE="Asia/Kolkata"
PORT=4000
```

Never commit the real `.env` file.

The repository intentionally contains `.env.example` so another developer knows which configuration values are required without exposing real credentials.

---

## 4. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 5. Database Migration

Make sure PostgreSQL is running.

For development migration:

```bash
npx prisma migrate dev
```

To apply existing committed migrations:

```bash
npx prisma migrate deploy
```

Prisma migration files are committed to the repository.

---

## 6. Seed the Database

From the backend directory:

```bash
npm run seed
```

The seed data provides enough information to demonstrate the application, including:

- Reporter account
- Agent account
- Sample tickets across priorities
- Sample holiday

---

## 7. Start the Backend

From:

```text
backend/
```

run:

```bash
bun run src/server.ts
```

The GraphQL endpoint is:

```text
http://localhost:4000/graphql
```

GraphQL Yoga provides GraphiQL for testing queries and mutations during development.

---

## 8. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite.

---

# Example GraphQL Operations

The following examples demonstrate some of the main API operations.

Authentication requires the JWT token returned by login for protected operations.

---

## Login

```graphql
mutation {
  login(
    email: "reporter@example.com"
    password: "Reporter@123"
  ) {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

---

## Create Ticket

```graphql
mutation {
  createTicket(
    title: "Unable to complete payment"
    description: "The payment fails after clicking the Pay button."
    priority: URGENT
  ) {
    id
    title
    priority
    status
    createdAt
  }
}
```

---

## List Tickets

```graphql
query {
  tickets(
    take: 10
    priority: HIGH
  ) {
    nodes {
      id
      title
      priority
      status
      assignee {
        id
        name
      }
      sla {
        firstResponseDueAt
        resolutionDueAt
        firstResponseState
        resolutionState
        firstResponseRemainingMinutes
        resolutionRemainingMinutes
      }
    }

    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## Fetch One Ticket

```graphql
query {
  ticket(id: "TICKET_ID") {
    id
    title
    description
    priority
    status
    createdAt
    firstResponseAt
    resolvedAt
    reporter {
      id
      name
    }
    assignee {
      id
      name
    }
    sla {
      firstResponseState
      resolutionState
      firstResponseRemainingMinutes
      resolutionRemainingMinutes
    }
  }
}
```

---

## Add Comment

```graphql
mutation {
  addComment(
    ticketId: "TICKET_ID"
    content: "We are investigating this issue."
  ) {
    id
    content
    createdAt
  }
}
```

---

## Assign Ticket

```graphql
mutation {
  assignTicket(
    ticketId: "TICKET_ID"
    assigneeId: "AGENT_ID"
  ) {
    id
    status
    assignee {
      id
      name
    }
  }
}
```

---

## Change Ticket Status

```graphql
mutation {
  changeTicketStatus(
    ticketId: "TICKET_ID"
    status: IN_PROGRESS
  ) {
    id
    status
  }
}
```

---

## Resolve Ticket

```graphql
mutation {
  resolveTicket(ticketId: "TICKET_ID") {
    id
    status
    resolvedAt
  }
}
```

---

## Dashboard

```graphql
query {
  dashboard {
    openTickets
    inProgressTickets
    atRiskTickets
    breachedTickets
  }
}
```

---

## Configured Holidays

```graphql
query {
  holidays {
    id
    date
    name
  }
}
```

---

# Testing

Automated tests verify the core business rules and database integration.

## Backend Type Check

```bash
cd backend
npx tsc --noEmit
```

---

## Run Backend Tests

```bash
bun test
```

Current verified test result:

```text
25 tests passed
0 tests failed
```

The test suite covers:

- Reporter ticket isolation
- Reporter cannot open another reporter's ticket
- Reporter cannot comment on another reporter's ticket
- Agent access across reporters
- Reporter-specific dashboard statistics
- Real PostgreSQL ticket flow
- First Agent response recording
- Normal weekday SLA calculation
- Before-business-hours tickets
- After-business-hours tickets
- Weekend handling
- Friday evening handling
- Public holidays
- Weekend plus holiday combinations
- SLA spanning multiple business days
- Exact 75% SLA boundary
- At Risk state
- Breached state
- Completed SLA freezing
- Resolution SLA
- Holiday configuration affecting deadlines
- Ticket lifecycle transitions
- Invalid lifecycle transitions
- Input validation

---

## PostgreSQL Integration Test

The integration test exercises the real Prisma/PostgreSQL persistence layer.

The tested flow includes:

```text
Create Ticket
     |
     v
Persist in PostgreSQL
     |
     v
Add Reporter Comment
     |
     v
Add Agent Comment
     |
     v
Record firstResponseAt
     |
     v
Verify persisted SLA information
```

PostgreSQL is not mocked for this integration flow.

---

## Frontend Production Build

```bash
cd frontend
npm run build
```

This performs TypeScript checking and creates the production Vite build.

---

# Security

The project includes:

- JWT authentication
- Secure password hashing
- Server-side role authorization
- Reporter ownership checks
- Protected ticket access
- Protected commenting
- Agent-only ticket-management operations
- Environment-variable based secrets
- `.env` exclusion through `.gitignore`

---

# Example Application Workflow

```text
Reporter registers / logs in
          |
          v
Reporter creates ticket
          |
          v
Backend calculates SLA deadlines
          |
          v
Ticket appears in Agent queue
          |
          v
Agent opens and assigns ticket
          |
          v
Agent sends first response
          |
          v
firstResponseAt recorded
          |
          v
Ticket moves to IN_PROGRESS
          |
          v
Agent resolves ticket
          |
          v
resolvedAt recorded
          |
          v
Resolution SLA frozen
          |
          v
Reporter sees resolved ticket and conversation
```

---

# Architecture Decisions & Tradeoffs

### Backend-Owned Business Rules

Authorization, SLA calculations, ticket transitions, and validation are implemented on the backend.

This prevents users from bypassing business rules by manipulating the frontend.

### Dedicated SLA Service

Business-time and SLA calculations are isolated from GraphQL resolvers.

This makes the SLA engine easier to test and maintain.

### Application-Level SLA Filtering

For the scope of this assignment, some SLA filtering and dashboard SLA calculations are performed in application logic after retrieving relevant ticket data.

For a substantially larger production system, SLA state could be precomputed or moved closer to the database for improved scalability.

### Agent Provisioning

The current demonstration environment uses a seeded Agent account.

Public registration creates Reporter accounts only.

A production implementation would normally include administrative Agent provisioning and organization/team permissions.

---

# Known Limitations

This implementation intentionally focuses on the core assignment requirements.

Current limitations include:

- No email notification system
- No SLA escalation notification service
- No organization/team hierarchy
- No administrative Agent-management interface
- No SLA pause state while waiting for the customer
- No full audit trail for every ticket change
- No CI/CD deployment pipeline

---

# How I'd Extend This

With additional development time, I would add:

- SLA pause while waiting for customer responses
- SLA escalation rules
- Email and in-app notifications
- Organization and team-based permissions
- Admin-managed Agent accounts
- Per-team business calendars
- Recurring holiday support
- Audit logs for status and assignment changes
- Agent performance metrics
- More advanced SLA policies
- Larger-scale database-side filtering
- Improved pagination and search
- Live SLA countdown updates
- End-to-end browser tests
- CI/CD pipeline
- Production deployment configuration
- Observability and structured logging

---

# Project Highlights

This project demonstrates:

- Full-stack TypeScript development
- Schema-first GraphQL API design
- PostgreSQL relational modeling
- Prisma migrations and relations
- JWT authentication
- Server-side role-based authorization
- Multi-user ticket isolation
- Business-hours-aware SLA calculations
- Weekend and holiday exclusion
- Configurable business timezone
- First-response and resolution SLA freezing
- Controlled ticket lifecycle transitions
- GraphQL validation and error handling
- Cursor-based pagination
- Dashboard statistics
- Automated unit testing
- Real PostgreSQL integration testing
- React frontend/backend integration

---

## License

This project was developed as a technical assignment and portfolio project.