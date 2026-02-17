package store

import (
	"database/sql"
	"fmt"
	"io/fs"

	"github.com/mattn/go-sqlite3"
	"github.com/pressly/goose/v3"
)

const dbFile string = "data.db"

func init() {
	sql.Register("sqlite3_fk",
		&sqlite3.SQLiteDriver{
			ConnectHook: func(sc *sqlite3.SQLiteConn) error {
				_, err := sc.Exec("PRAGMA foreign_keys = ON", nil)
				return err
			},
		})
}

func Open() (*sql.DB, error) {
	db, err := sql.Open("sqlite3_fk", dbFile)
	if err != nil {
		return nil, fmt.Errorf("db: open %w", err)
	}

	fmt.Println("Connected to the database...")

	var fkEnabled int
	err = db.QueryRow("PRAGMA foreign_keys").Scan(&fkEnabled)
	if err != nil {
		return nil, fmt.Errorf("db: pragma %w", err)
	}
	fmt.Printf("db: foreign keys enabled: %d\n", fkEnabled)

	return db, nil
}

func MigrateFS(db *sql.DB, migrationsFS fs.FS, dir string) error {
	goose.SetBaseFS(migrationsFS)
	defer func() {
		goose.SetBaseFS(nil)
	}()
	return Migrate(db, dir)

}

func Migrate(db *sql.DB, dir string) error {
	err := goose.SetDialect("sqlite3")
	if err != nil {
		return fmt.Errorf("migrate: %w", err)
	}

	err = goose.Up(db, dir)
	if err != nil {
		return fmt.Errorf("goose up: %w", err)
	}

	return nil
}
