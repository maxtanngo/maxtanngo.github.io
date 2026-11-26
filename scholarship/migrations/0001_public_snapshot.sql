CREATE TABLE public_snapshot (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    generated_at TEXT NOT NULL,
    body TEXT NOT NULL CHECK (json_valid(body))
);
