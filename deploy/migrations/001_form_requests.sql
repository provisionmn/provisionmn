BEGIN;
CREATE TABLE IF NOT EXISTS form_requests (
  id uuid PRIMARY KEY,
  idempotency_key uuid NOT NULL UNIQUE,
  payload_hash text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('contact', 'quote')),
  email text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS form_requests_created_at_idx ON form_requests (created_at);
COMMIT;
