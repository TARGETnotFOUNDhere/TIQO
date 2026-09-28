from pydantic import BaseModel, EmailStr
from typing import Optional, List

class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    priority: Optional[str] = "Medium"

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None

class NoteCreate(BaseModel):
    note_text: str

class NoteResponse(BaseModel):
    id: str
    ticket_id: str
    note_text: str
    created_at: str

class TicketResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    priority: Optional[str] = "Medium"
    created_at: str
    updated_at: Optional[str] = None
    notes: Optional[List[NoteResponse]] = []
