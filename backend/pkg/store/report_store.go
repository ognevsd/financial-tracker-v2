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
	GetReportById(id string) (*Report, error)
	UpdateReport(*Report) error
	DeleteReportById(id string) error
}

func (store *SqliteReportStore) AddReport(report *Report) (*Report, error) {
	query :=
		`INSERT INTO report (id, name)
		VALUES ($1, $2)
		RETURNING (id)
		`
	newReportId := uuid.New().String()
	err := store.db.QueryRow(query, newReportId, report.Name).Scan(&report.ID)
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

func (store *SqliteReportStore) GetReportById(id string) (*Report, error) {
	query := `SELECT id, name FROM report WHERE id = $1`

	report := &Report{}

	err := store.db.QueryRow(query, id).Scan(
		&report.ID,
		&report.Name,
	)
	if err != nil {
		return nil, err
	}

	return report, nil
}

func (store *SqliteReportStore) UpdateReport(report *Report) error {
	query :=
		`UPDATE report
		SET name = $1
		WHERE id = $2
		`

	res, err := store.db.Exec(query, report.Name, report.ID)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (store *SqliteReportStore) DeleteReportById(id string) error {
	query := `DELETE FROM report WHERE id = $1`
	res, err := store.db.Exec(query, id)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
