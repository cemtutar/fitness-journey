# GainzKeeper

GainzKeeper is a full-stack fitness tracker that lets athletes capture detailed
workout logs, review historical sessions, and monitor long-term strength trends.
The project combines a Node.js REST API with a modern React client that renders
interactive progress charts via Recharts.

## Architecture

```
├── server/   # Express API for authentication, workouts, and progress insights
└── client/   # Vite + React single-page application
```

- **Backend:** Express, JSON file persistence, JWT authentication, bcrypt
  password hashing.
- **Frontend:** React 18, Vite tooling, Recharts data visualizations.
- **State & data flow:** The client authenticates against the API, stores the
  issued JWT in memory, and uses it for subsequent authorized requests to manage
  workouts and retrieve progress metrics.

## Features

- 📆 **Workout logging** – capture training dates, notes, exercises, and detailed
  sets (reps × weight).
- 📈 **Progress analytics** – visualize total lifted volume per exercise over
  time using multi-series line charts.
- 🔐 **Account management** – register new users and sign in securely with hashed
  credentials and JWT-protected routes.
- 🧾 **Workout history** – browse previous sessions, review notes, and remove
  outdated entries.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
# Install API dependencies
cd server
npm install

# Install web client dependencies
cd ../client
npm install
```

### Configure environment (optional)

The API supports the following environment variables (defaults shown):

- `PORT=4000` – server port
- `CLIENT_ORIGIN=http://localhost:5173` – allowed CORS origin
- `JWT_SECRET=dev-secret-change-me` – secret key for signing JWTs

Create a `.env` file in `server/` (or export variables) to customize values.

### Run the development stack

```bash
# In one terminal – start the API
cd server
npm start

# In another terminal – start the web client
cd client
npm run dev
```

Open the client at [http://localhost:5173](http://localhost:5173). The UI will
prompt you to register, then use your new credentials to sign in and begin
logging workouts.

## API Overview

The Express API exposes the following routes (all JSON):

| Method | Route            | Description                              |
| ------ | ---------------- | ---------------------------------------- |
| POST   | `/auth/register` | Create a new user and return a JWT token |
| POST   | `/auth/login`    | Authenticate and return a JWT token      |
| GET    | `/workouts`      | List workouts for the authenticated user |
| POST   | `/workouts`      | Create a workout                         |
| PUT    | `/workouts/:id`  | Update a workout                         |
| DELETE | `/workouts/:id`  | Delete a workout                         |
| GET    | `/progress`      | Aggregated volume per exercise over time |

Requests to `/workouts` and `/progress` require an `Authorization: Bearer <JWT>`
header from the authentication endpoints.

## Data Storage

User accounts and workouts are stored in `server/db.json`. The file is created
automatically on first run and is excluded from version control. Each workout
stores:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "date": "2024-03-18T00:00:00.000Z",
  "notes": "Bench and accessories",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": [
        { "reps": 5, "weight": 185 },
        { "reps": 5, "weight": 185 }
      ]
    }
  ]
}
```

## Frontend Highlights

- Guided authentication flow with form validation and helpful loading states.
- Dynamic workout form to add multiple exercises and sets per session.
- Historical workout list with quick delete actions.
- Responsive charts that adapt to different screen sizes.

## Future Enhancements

- Replace JSON persistence with DynamoDB or another managed database.
- Deploy the API and client with infrastructure-as-code (e.g., AWS Amplify).
- Add social features such as friend leaderboards or shared programs.

---

GainzKeeper provides a solid foundation for tracking strength training progress
locally while leaving room to integrate cloud-native services when you are ready
to scale.
