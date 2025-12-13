package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type Report struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SqliteReportStore struct {
	db *sql.DB
}

func NewSqliteReportStore(db *sql.DB) *SqliteReportStore {
	return &SqliteReportStore{db: db}
}

type ReportStore interface {
	AddReport(*Report) (*Report, error)
	GetAllReports() ([]*Report, error)
}

func (store *SqliteReportStore) AddReport(report *Report) (*Report, error) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query :=
		`INSERT INTO report (id, name)
		VALUES ($1, $2)
		RETURNING (id)
		`
	newReportId := uuid.New().String()
	err = tx.QueryRow(query, newReportId, report.Name).Scan(&report.ID)
	if err != nil {
		return nil, err
	}
	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return report, nil
}

func (store *SqliteReportStore) GetAllReports() ([]*Report, error) {
	query := `SELECT id, name FROM report`
	var reports []*Report

	rows, err := store.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		report := &Report{}
		err := rows.Scan(&report.ID, &report.Name)
		if err != nil {
			return nil, err
		}

		reports = append(reports, report)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return reports, nil
}
