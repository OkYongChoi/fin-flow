CREATE TABLE briefs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  document TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX briefs_owner ON briefs(user_id, updated_at);
CREATE TABLE checkout_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  product_id TEXT NOT NULL,
  checkout_id TEXT,
  checkout_url TEXT,
  state TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX one_pending_checkout ON checkout_attempts(user_id, environment) WHERE state = 'pending';
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL,
  paid_until INTEGER NOT NULL DEFAULT 0,
  event_at INTEGER NOT NULL,
  blocked INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX subscription_owner ON subscriptions(user_id, environment);
CREATE TABLE billing_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at INTEGER NOT NULL
);
