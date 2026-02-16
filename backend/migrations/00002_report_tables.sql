-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS report (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT current_timestamp,
    updated_at TEXT NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS report_section (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    report_id TEXT REFERENCES report(id),
    order_index INTEGER NOT NULL CHECK(order_index >= 0),
    parent_id TEXT REFERENCES report_section(id),
    created_at TEXT NOT NULL DEFAULT current_timestamp,
    updated_at TEXT NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS taxonomy (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    report_id TEXT NOT NULL REFERENCES report(id),
    created_at TEXT NOT NULL DEFAULT current_timestamp,
    updated_at TEXT NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS report_field (
    id TEXT PRIMARY KEY NOT NULL,
    original_name TEXT NOT NULL,
    order_index INTEGER NOT NULL CHECK(order_index >= 0),
    report_id TEXT NOT NULL REFERENCES report(id),
    section_id TEXT NOT NULL REFERENCES report_section(id),
    asset_id TEXT NOT NULL REFERENCES asset(id),
    taxonomy_id TEXT REFERENCES taxonomy(id),
    created_at TEXT NOT NULL DEFAULT current_timestamp,
    updated_at TEXT NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS field_value (
    id TEXT PRIMARY KEY NOT NULL,
    field_id TEXT NOT NULL REFERENCES report_field(id),
    year INTEGER NOT NULL CHECK(year > 0),
    value INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT current_timestamp,
    updated_at TEXT NOT NULL DEFAULT current_timestamp
);
-- +goose StatementEnd 

-- +goose Down
-- +goose StatementBegin
DROP TABLE field_value;
DROP TABLE report_field;
DROP TABLE taxonomy;
DROP TABLE report_section;
DROP TABLE report;
-- +goose StatementEnd
