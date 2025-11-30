package store

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

const dbFile string = "data.db"

func Open() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbFile)
	if err != nil {
		return nil, fmt.Errorf("db: open %w", err)
	}

	fmt.Println("Connected to the database...")

	return db, nil
}
