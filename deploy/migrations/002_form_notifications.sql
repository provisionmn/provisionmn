BEGIN;
CREATE TABLE IF NOT EXISTS form_notifications (
  request_id uuid PRIMARY KEY REFERENCES form_requests(id),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  failed_at timestamptz
);
CREATE INDEX IF NOT EXISTS form_notifications_pending_idx
  ON form_notifications (next_attempt_at)
  WHERE sent_at IS NULL AND failed_at IS NULL;
-- Deliberately do not backfill historical requests.
COMMIT;
