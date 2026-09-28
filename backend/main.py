from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uuid
from datetime import datetime, timezone
from pathlib import Path

if __package__:
    from .database import supabase
    from .models import TicketCreate, TicketUpdate
else:
    from database import supabase
    from models import TicketCreate, TicketUpdate

app = FastAPI(title="TIQO Support API", version="1.0.0")

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to your deployed frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory fallback (used when Supabase is not configured) ─────────────────
MOCK_DB: dict = {"tickets": [], "notes": []}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _generate_ticket_id() -> str:
    """Return the next TQ-NNN id, safe for the mock DB.
    For Supabase this is called inside the request; true uniqueness at scale
    is guaranteed by the UNIQUE constraint — a 409 would surface on collision."""
    if supabase:
        resp = (
            supabase.table("tickets")
            .select("ticket_id")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        rows = resp.data or []
    else:
        rows = MOCK_DB["tickets"][-1:] if MOCK_DB["tickets"] else []

    if rows:
        last = rows[0]["ticket_id"]          # e.g. "TQ-007"
        try:
            num = int(last.split("-")[1])
            return f"TQ-{num + 1:03d}"
        except (IndexError, ValueError):
            pass
    return "TQ-001"


def _validate_ticket_fields(data: TicketCreate) -> None:
    """Raise 400 if any required text field is blank after stripping."""
    errors = []
    if not data.customer_name.strip():
        errors.append("customer_name must not be blank")
    if not data.subject.strip():
        errors.append("subject must not be blank")
    if not data.description.strip():
        errors.append("description must not be blank")
    if errors:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="; ".join(errors))


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "ok", "db": "supabase" if supabase else "mock"}


# ─── Create ticket ────────────────────────────────────────────────────────────

@app.post("/api/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate):
    _validate_ticket_fields(ticket)

    ticket_id = _generate_ticket_id()
    now = _now()

    new_ticket = {
        "id": str(uuid.uuid4()),
        "ticket_id": ticket_id,
        "customer_name": ticket.customer_name.strip(),
        "customer_email": ticket.customer_email.strip().lower(),
        "subject": ticket.subject.strip(),
        "description": ticket.description.strip(),
        "status": "Open",
        "priority": ticket.priority or "Medium",
        "created_at": now,
        "updated_at": now,
    }

    if supabase:
        try:
            resp = supabase.table("tickets").insert(new_ticket).execute()
            if not resp.data:
                raise HTTPException(status_code=500, detail="Failed to create ticket")
            created_at = resp.data[0]["created_at"]
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Failed to create ticket") from exc
    else:
        MOCK_DB["tickets"].append(new_ticket)
        created_at = now

    return {"ticket_id": ticket_id, "created_at": created_at}


# ─── List tickets ─────────────────────────────────────────────────────────────

@app.get("/api/tickets")
def get_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
):
    if supabase:
        query = supabase.table("tickets").select("*").order("created_at", desc=True)
        if status and status != "All":
            query = query.eq("status", status)
        if priority and priority != "All":
            query = query.eq("priority", priority)
        try:
            data = query.execute().data or []
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Failed to fetch tickets") from exc
    else:
        data = sorted(MOCK_DB["tickets"], key=lambda x: x["created_at"], reverse=True)
        if status and status != "All":
            data = [t for t in data if t["status"] == status]
        if priority and priority != "All":
            data = [t for t in data if t.get("priority") == priority]

    if search:
        term = search.lower()
        data = [
            t for t in data
            if term in t["ticket_id"].lower()
            or term in t["customer_name"].lower()
            or term in t["customer_email"].lower()
            or term in t["subject"].lower()
            or term in (t.get("description") or "").lower()
        ]

    return data


# ─── Get single ticket ────────────────────────────────────────────────────────

@app.get("/api/tickets/{ticket_id}")
def get_ticket(ticket_id: str):
    if supabase:
        try:
            resp = supabase.table("tickets").select("*").eq("ticket_id", ticket_id).execute()
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Failed to fetch ticket") from exc
        if not resp.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        ticket = resp.data[0]
        try:
            notes_resp = (
                supabase.table("notes")
                .select("*")
                .eq("ticket_id", ticket["id"])
                .order("created_at", desc=False)
                .execute()
            )
            ticket["notes"] = notes_resp.data or []
        except Exception:
            ticket["notes"] = []
    else:
        ticket = next((t for t in MOCK_DB["tickets"] if t["ticket_id"] == ticket_id), None)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        ticket = dict(ticket)
        ticket["notes"] = sorted(
            [n for n in MOCK_DB["notes"] if n["ticket_id"] == ticket["id"]],
            key=lambda x: x["created_at"],
        )

    return ticket


# ─── Update ticket ────────────────────────────────────────────────────────────

@app.put("/api/tickets/{ticket_id}")
def update_ticket(ticket_id: str, body: TicketUpdate):
    if supabase:
        try:
            resp = supabase.table("tickets").select("id").eq("ticket_id", ticket_id).execute()
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Failed to fetch ticket") from exc
        if not resp.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        internal_id = resp.data[0]["id"]
    else:
        ticket = next((t for t in MOCK_DB["tickets"] if t["ticket_id"] == ticket_id), None)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        internal_id = ticket["id"]

    now = _now()

    # Build update payload
    update_data: dict = {}
    if body.status:
        valid_statuses = {"Open", "In Progress", "Closed"}
        if body.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
            )
        update_data["status"] = body.status
    if body.priority:
        update_data["priority"] = body.priority

    if update_data:
        update_data["updated_at"] = now
        if supabase:
            try:
                supabase.table("tickets").update(update_data).eq("id", internal_id).execute()
            except Exception as exc:
                raise HTTPException(status_code=500, detail="Failed to update ticket") from exc
        else:
            ticket.update(update_data)

    # Add note if provided
    if body.notes and body.notes.strip():
        note_data = {
            "id": str(uuid.uuid4()),
            "ticket_id": internal_id,
            "note_text": body.notes.strip(),
            "created_at": now,
        }
        if supabase:
            try:
                supabase.table("notes").insert(note_data).execute()
            except Exception as exc:
                raise HTTPException(status_code=500, detail="Failed to save note") from exc
        else:
            MOCK_DB["notes"].append(note_data)

    # Return current updated_at
    if supabase:
        try:
            row = supabase.table("tickets").select("updated_at").eq("id", internal_id).execute()
            updated_at = row.data[0]["updated_at"] if row.data else now
        except Exception:
            updated_at = now
    else:
        updated_at = ticket.get("updated_at", now)

    return {"success": True, "updated_at": updated_at}


# ─── Delete ticket ────────────────────────────────────────────────────────────

@app.delete("/api/tickets/{ticket_id}", status_code=status.HTTP_200_OK)
def delete_ticket(ticket_id: str):
    if supabase:
        try:
            resp = supabase.table("tickets").select("id").eq("ticket_id", ticket_id).execute()
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Failed to fetch ticket") from exc
        if not resp.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        internal_id = resp.data[0]["id"]
        try:
            # Notes are deleted by ON DELETE CASCADE in the DB,
            # but we delete explicitly too for the mock-DB path consistency.
            supabase.table("notes").delete().eq("ticket_id", internal_id).execute()
            supabase.table("tickets").delete().eq("id", internal_id).execute()
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Failed to delete ticket") from exc
    else:
        ticket = next((t for t in MOCK_DB["tickets"] if t["ticket_id"] == ticket_id), None)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        MOCK_DB["tickets"] = [t for t in MOCK_DB["tickets"] if t["id"] != ticket["id"]]
        MOCK_DB["notes"] = [n for n in MOCK_DB["notes"] if n["ticket_id"] != ticket["id"]]

    return {"success": True, "ticket_id": ticket_id}


frontend_dist = "frontend/dist"
if Path(frontend_dist).is_dir():
    app.frontend("/", directory=frontend_dist, fallback="index.html")
