-- MCXI Play — Initial schema

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_mxn INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  game_type TEXT NOT NULL,
  default_config TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS template_versions (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES templates(id),
  version INTEGER NOT NULL,
  config_schema TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(template_id, version)
);

CREATE TABLE IF NOT EXISTS buyers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  buyer_id TEXT NOT NULL REFERENCES buyers(id),
  template_id TEXT NOT NULL REFERENCES templates(id),
  personalization TEXT NOT NULL,
  price_mxn INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_date TEXT,
  payment_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);

CREATE TABLE IF NOT EXISTS gifts (
  id TEXT PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL REFERENCES orders(id),
  public_slug TEXT UNIQUE NOT NULL,
  buyer_token TEXT UNIQUE NOT NULL,
  config TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  play_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gifts_public_slug ON gifts(public_slug);
CREATE INDEX IF NOT EXISTS idx_gifts_buyer_token ON gifts(buyer_token);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT,
  performed_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

-- Seed: first template
INSERT OR IGNORE INTO templates (id, slug, name, description, price_mxn, active, game_type, default_config, created_at, updated_at)
VALUES (
  '01JBKZ0001TEMPLATE0001',
  'atrapa-mi-corazon',
  'Atrapa mi corazón',
  'Un juego arcade donde recoges diez corazones, esquivas obstáculos y desbloqueas una dedicatoria personalizada. Perfecto para San Valentín, cumpleaños o cualquier ocasión romántica.',
  14900,
  1,
  'catch-hearts',
  '{"recipientName":"Jugador","senderName":"Tu admirador secreto","dedication":"¡Este juego fue hecho especialmente para ti!","theme":"romantic","primaryColor":"#e91e63","secondaryColor":"#9c27b0"}',
  '2026-10-28T00:00:00Z',
  '2026-10-28T00:00:00Z'
);

INSERT OR IGNORE INTO template_versions (id, template_id, version, config_schema, created_at)
VALUES (
  '01JBKZ0001TPLVER00001',
  '01JBKZ0001TEMPLATE0001',
  1,
  '{"type":"object","properties":{"recipientName":{"type":"string","maxLength":30},"senderName":{"type":"string","maxLength":30},"dedication":{"type":"string","maxLength":200},"theme":{"type":"string","enum":["romantic","birthday","friendship"]},"primaryColor":{"type":"string","pattern":"^#[0-9a-fA-F]{6}$"},"secondaryColor":{"type":"string","pattern":"^#[0-9a-fA-F]{6}$"}},"required":["recipientName","senderName","dedication","theme","primaryColor","secondaryColor"]}',
  '2026-10-28T00:00:00Z'
);
