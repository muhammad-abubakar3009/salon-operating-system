# Salon OS — Salon Operating System

A full-stack salon management platform built as a complete operations system, not just a booking tool: client relationship management, appointment scheduling, staff management with role-based access control, a hair-color formula history feature (the "Colorist Workspace"), and inventory tracking with a full audit trail.

Built solo, end to end — schema design, REST API, authentication, and a React frontend — as a way to apply and deepen full-stack skills on a project with real business logic rather than a tutorial clone.

## Features

**Authentication & Access Control**
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Owner / Stylist / Receptionist) enforced at the middleware level
- Email-based password reset with single-use, time-limited tokens

**Client CRM**
- Full client records with search, edit, and safe deletion (blocked if the client has an active appointment)
- Per-client detail view combining profile, appointment history, and formula history in one place

**Appointment Scheduling**
- Booking with stylist and client assignment
- Status lifecycle (booked → completed / cancelled) with validated transitions

**Colorist Workspace (Formula History)**
- The project's flagship feature: every color service can have its exact formula, developer ratio, processing time, and stylist notes logged against the appointment
- Full chronological color history per client — the actual problem this project set out to solve

**Staff Management**
- Owner-only staff account creation with role assignment
- Frontend and backend both enforce the owner-only boundary (UI hides restricted actions; API independently rejects unauthorized requests)

**Inventory Management**
- Product catalog with SKU-based uniqueness
- Stock adjustments logged as an auditable history (who, when, why, how much) rather than a single mutable number
- Adjustments and stock updates run as an atomic database transaction, so the running total and the audit log can never drift out of sync
- Low-stock indicator based on a configurable reorder threshold

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, Prisma ORM
**Frontend:** React (Vite), React Router, Axios
**Auth:** JWT, bcrypt
**Email:** Nodemailer / Mailtrap (transactional email for password resets)

## Architecture Notes

- Relational schema modeled around real business constraints: a `Formula` is one-to-one with the `Appointment` it came from (enforced via a unique foreign key), a `Client` cannot be deleted while they have an active appointment, and stock adjustments are append-only log entries rather than direct mutations.
- Role-based middleware (`requireOwner`) composes with authentication middleware to restrict specific routes without duplicating auth logic.
- Multi-step operations that must succeed or fail together (e.g., logging a stock adjustment *and* updating the running total) use Prisma's `$transaction` to guarantee consistency.

## Project Structure

```
Backend/
  routes/          REST endpoints (clients, appointments, formulas, users, products)
  middleware/       Auth and role-based access control
  prisma/           Schema and migrations
  utils/            Email sending

Frontend/
  src/pages/        One component per screen
  src/components/   Shared UI (Navbar, route guards)
  src/api/          Axios instance with auth token interceptor
```

## Running Locally

**Backend**
```bash
cd Backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, MAILTRAP_TOKEN
npx prisma migrate dev
node backend.js
```

**Frontend**
```bash
cd Frontend
npm install
npm run dev
```

## Status

Core feature set (Auth, Client CRM, Appointments, Colorist Workspace, Staff Management, Inventory) is complete and functional end to end. Built as a portfolio/learning project — not currently deployed for a live salon.