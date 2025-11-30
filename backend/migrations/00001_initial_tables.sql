-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS currency (
    id TEXT PRIMARY KEY NOT NULL,
    code TEXT NOT NULL UNIQUE CHECK(length(code) = 3), -- Code in ISO format e.g. 'USD', 'EUR'
    name TEXT NOT NULL,
    decimals INTEGER DEFAULT 2 CHECK(decimals >= 0 AND decimals <= 8),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS operation (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE, -- e.g. "buy", "sell", "dividend"
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset (
    id TEXT PRIMARY KEY NOT NULL,
    symbol TEXT NOT NULL, -- e.g. 'AAPL', 'SPY'
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g. 'stock', 'etf'
    industry TEXT,
    commodity TEXT,
    currency_id TEXT NOT NULL REFERENCES currency(id),
    rep_multiplicator INTEGER, -- e.g. in thousands == 1000, in millions = 1000000
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "transaction" (
    id TEXT PRIMARY KEY NOT NULL,
    operation_id TEXT NOT NULL REFERENCES operation(id),
    symbol TEXT NOT NULL,
    date TEXT NOT NULL CHECK(date(date) IS date),
    type TEXT NOT NULL, -- e.g. 'share', 'option'
    quantity INTEGER NOT NULL CHECK(quantity >= 0),
    price INTEGER NOT NULL CHECK(price >= 0), -- total in smallest unit (e.g. cents), to avoid floating point
    currency_id TEXT NOT NULL REFERENCES currency(id),
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE transaction;
DROP TABLE asset;
DROP TABLE operation;
DROP TABLE currency;
-- +goose StatementEnd
