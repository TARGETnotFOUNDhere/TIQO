# TIQO

Customer Support Ticketing CRM System - A modern SaaS-style dashboard for managing customer support requests. Built for the Datastraw Technologies AI + Tech Intern position assessment.

## 1. Overview
TIQO is a premium, modern SaaS-style customer support management interface. It provides an intuitive, fast, and responsive user experience for agents to manage, search, filter, and respond to support tickets.

## 2. Features
- **Ticket Management**: Create, view, update, and manage support tickets.
- **Dynamic Search**: Instant searching across ticket IDs, customer details, and content.
- **Filtering**: Easily filter tickets by their current status (Open, In Progress, Closed).
- **Internal Notes**: Add chronological internal notes to tickets.
- **Priority System (Bonus)**: Thoughtfully integrated ticket priority levels (Low, Medium, High) to help support teams identify urgent customer issues at a glance.
- **Modern UI**: Clean, professional design with subtle animations, logical layout, and responsive mobile-friendly views.

## 3. Tech Stack
**Frontend**:
- React 19 + Vite
- Tailwind CSS v4
- React Router DOM
- Lucide React (Icons)
- date-fns (Date formatting)

**Backend**:
- Python + FastAPI
- Pydantic (Data validation)
- Supabase PostgreSQL

## 4. Architecture
The application uses a separated frontend-backend architecture:
- React Frontend (Vite) runs independently and connects to the API via REST.
- FastAPI Backend serves as the robust API layer and handles business logic and DB communication.
- Supabase PostgreSQL provides secure, persistent data storage.
- A clean API client layer encapsulates `axios` for organized network requests.

*(Note: The backend gracefully falls back to in-memory mock data if Supabase credentials are not provided, ensuring seamless local testing out of the box).*

## 5. Database Schema
We use two simple tables:

**TICKETS**
- `id` (UUID, PK)
- `ticket_id` (String, e.g., TKT-001, Unique)
- `customer_name` (String)
- `customer_email` (String)
- `subject` (String)
- `description` (Text)
- `status` (String: Open, In Progress, Closed)
- `priority` (String: Low, Medium, High)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**NOTES**
- `id` (UUID, PK)
- `ticket_id` (UUID, FK -> tickets.id)
- `note_text` (Text)
- `created_at` (Timestamp)

*(A `schema.sql` file is provided in the `/backend` folder to execute in Supabase SQL Editor).*

## 6. API Endpoints
- `GET /api/health` - Check API status.
- `GET /api/tickets?status={status}&search={term}` - List and filter tickets.
- `GET /api/tickets/{ticket_id}` - Get single ticket with notes.
- `POST /api/tickets` - Create new ticket.
- `PUT /api/tickets/{ticket_id}` - Update status, priority, or add a note.

## 7. Project Structure
```text
/
├── frontend/
│   ├── src/
│   │   ├── api/          # API client and service layer
│   │   ├── components/   # UI components grouped by feature
│   │   ├── pages/        # Page-level components
│   │   ├── App.jsx       # Routing setup
│   │   └── main.jsx      # React entrypoint
│   └── .env.example
├── backend/
│   ├── main.py           # FastAPI application & routes
│   ├── database.py       # Supabase client setup
│   ├── models.py         # Pydantic schemas
│   ├── schema.sql        # Supabase database setup script
│   ├── requirements.txt  # Python dependencies
│   └── .env.example
└── README.md
```

## 8. Environment Variables
You will find `.env.example` files in both `frontend` and `backend` directories.

**Frontend (`frontend/.env`)**:
`VITE_API_BASE_URL=http://localhost:8000`

**Backend (`backend/.env`)**:
`SUPABASE_URL=your-project-url`
`SUPABASE_ANON_KEY=your-anon-key`

## 9. Local Setup
Ensure you have Node.js (v18+) and Python (v3.9+) installed.

## 10. Running Frontend
```bash
cd frontend
npm install
npm run dev
```

## 11. Running Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 12. Deployment
- **Frontend**: Deployable to Vercel. Simply import the `frontend` folder, and set the build command to `npm run build` and output directory to `dist`. Add `VITE_API_BASE_URL` in environment variables.
- **Backend**: Deployable to Render or Railway. Point to the `backend` folder, install requirements, and run `uvicorn main:app --host 0.0.0.0 --port $PORT`. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the environment variables.

## 13. Bonus Feature: Priority
Priority levels (High, Medium, Low) were added because real support teams need a quick, visual way to identify urgent customer issues. The visual indicator integrates seamlessly into the SaaS-style design with clean, colored badges.

## 14. Challenges & Solutions
- **Immediate Feedback for Search**: Implemented debounce in React to avoid spamming the backend API on every keystroke, keeping the search fluid but performant.
- **Robust UI UX**: Handling "Empty states" and "Loading states" using animated skeletons ensures that the user never looks at a blank screen or broken layout.
- **No-Credentials Setup**: Set up an intelligent fallback system in the FastAPI backend. It checks for Supabase variables; if missing, it seamlessly uses a memory store so the app can be immediately reviewed without configuring a database.

## 15. Future Improvements
- **Authentication**: Implementing Supabase Auth for agent login and role-based access control.
- **Pagination**: As ticket volume grows, implementing cursor-based pagination for the dashboard.
- **Realtime Updates**: Using Supabase Realtime subscriptions to show new tickets coming in without refreshing the page.
