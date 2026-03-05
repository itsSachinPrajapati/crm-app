# CRM Application

A full-stack Customer Relationship Management (CRM) web application designed to manage the full business lifecycle from **lead acquisition to project delivery and payment tracking**.

The system includes structured modules for managing leads, clients, projects, tasks, milestones, and payments, along with role-based access and tenant-aware architecture suitable for SaaS-style applications.

---

## Live Application

Frontend
https://crm-app.in

Backend API
https://api.crm-app.in

---

## Core Features

Authentication

* Secure user registration and login
* JWT authentication with HTTP-only cookies
* Protected API routes

Lead Management

* Create and manage leads
* Track lead status pipeline
* Convert leads into clients

Client Management

* Maintain client records
* View client-associated projects

Project Management

* Create projects linked to clients
* Manage project milestones
* Track deadlines and project status

Payments

* Record project payments
* Track payment status and transaction history

Role-Based Access Control (RBAC)

* Different permissions based on user roles
* Role-restricted actions across modules

Activity Logging (Partial Implementation)

* Records selected system activities
* Tracks important updates in modules

Multi-Tenant Aware Architecture

* Designed with tenant isolation principles
* Data separation prepared for SaaS scaling

Dashboard

* Overview of system activity
* Project and task summaries

---

## Technology Stack

Frontend
React
Vite
Tailwind CSS
Axios

Backend
Node.js
Express.js
JWT Authentication
bcrypt password hashing

Database
MySQL

Deployment
Vercel — Frontend hosting
Render — Backend API hosting
Railway — MySQL database

---

## System Architecture

User
↓
Frontend (Vercel)
https://crm-app.in

↓ API Requests

Backend API (Render)
https://api.crm-app.in

↓

MySQL Database (Railway)

---

## Project Structure

crm-app

frontend/
React frontend application

backend/
Express API server
controllers/
routes/
middleware/
config/

Database/
SQL schema and database setup

docs/
Project documentation and diagrams

---

## Environment Variables

Backend (.env)

PORT=5000
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=

Frontend (.env)

VITE_API_URL=https://api.crm-app.in/api

---

## Installation

Clone repository

git clone https://github.com/itsSachinPrajapati/crm-app.git

Backend setup

cd backend
npm install
npm run dev

Frontend setup

cd frontend
npm install
npm run dev

---

## API Modules

Authentication
/api/auth

Leads
/api/leads

Clients
/api/clients

Projects
/api/projects

Payments
/api/payments

---

## Testing

All backend API endpoints were tested using Postman to verify authentication, CRUD operations, business logic validation, and error handling.

A detailed backend testing report including test cases, request examples, and expected responses is available in the project documentation.

See the full report here:

docs/TEST_SUMMARY.md
docs/CRM_QA.xlsx

---

## Future Improvements

Full activity audit logs
Email notifications
File uploads for projects and tasks
Advanced analytics dashboard
Mobile responsive dashboard
Exportable reports
Tenant-level configuration and billing
Task management module with Kanban board for task creation, assignment, and status tracking.


---

## License

This project is created for educational, demonstration, and portfolio purposes.
