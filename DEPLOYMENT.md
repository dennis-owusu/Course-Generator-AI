# NurseHub Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB cluster (MongoDB Atlas recommended)
- A server or platform with support for Node.js (Render, Railway, VPS, etc.)
- Domain with HTTPS enabled for production

## Environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

### Required

- `MONGODB_URI` — production MongoDB connection string
- `JWT_SECRET` — strong random string (min 32 chars)
- `NODE_ENV=production`
- `PORT` — usually provided by the platform

### Optional

- `CLIENT_URL` — production frontend URL for CORS
- `GITHUB_TOKEN` — enables real AI responses in the Study Assistant
- `YOUTUBE_API_KEY` — enables YouTube video enrichment in generated courses
- `MONGODB_TEST_URI` — dedicated test database (recommended for CI)

## Build

```bash
npm install
npm run build   # installs deps and builds the React client
```

## Start

```bash
npm start
```

The Express server serves the built client from `client/dist` and API routes under `/api`.

## Account provisioning

- New registrations default to the `student` role.
- To create the first administrator, use a secure MongoDB shell or one-time script; never ship a default admin password in code.
- Teachers must be promoted by an administrator.

## Security checklist

- HTTPS is required in production so cookies are transmitted securely.
- `JWT_SECRET` must be unique and not committed to version control.
- MongoDB network access should be restricted to the application server.
- Uploaded documents are protected behind authentication (`/uploads/documents`).
- Public images (`/uploads/images`) are appropriate only for course banners and avatars.
- Keep dependencies up to date and run `npm audit` regularly.

## Health check

Visit `/api/health` (if implemented) or confirm the server responds on the configured port.

## Running tests

```bash
npm test
```

Tests use `MONGODB_TEST_URI` if provided. If not, they fall back to `mongodb-memory-server`, which downloads a MongoDB binary on first run. On slow or resource-constrained machines this download can time out; rerun the suite or provide a local/remote `MONGODB_TEST_URI` for stable CI runs.

