-- MCXI Play — Fixed-window rate limiting (SEC-006)
-- key examples: "login:<ip>", "order:<ip>"

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
