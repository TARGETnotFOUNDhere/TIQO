-- ─── TIQO — Supabase PostgreSQL schema ───────────────────────────────────────
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tickets ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id   VARCHAR(20) UNIQUE NOT NULL,          -- e.g. TQ-001
    customer_name  VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    subject     VARCHAR(500) NOT NULL,
    description TEXT         NOT NULL,
    status      VARCHAR(50)  NOT NULL DEFAULT 'Open', -- Open | In Progress | Closed
    priority    VARCHAR(20)  NOT NULL DEFAULT 'Medium', -- High | Medium | Low
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Notes ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id   UUID        NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    note_text   TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast note lookups by ticket
CREATE INDEX IF NOT EXISTS idx_notes_ticket_id ON notes(ticket_id);

-- Index for ticket_id string lookups (search + detail page)
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- TIQO uses the anon key from the backend only — no per-user auth yet.
-- These policies give the anon role full CRUD access.
-- Swap for auth-based policies once you add authentication.

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes   ENABLE ROW LEVEL SECURITY;

-- Drop policies first so this script is safely re-runnable
DROP POLICY IF EXISTS "anon_all_tickets" ON tickets;
DROP POLICY IF EXISTS "anon_all_notes"   ON notes;

CREATE POLICY "anon_all_tickets" ON tickets
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_all_notes" ON notes
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── updated_at auto-trigger ──────────────────────────────────────────────────
-- Keeps updated_at current whenever a ticket row changes.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
