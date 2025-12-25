package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type ReportSection struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	ReportId   string `json:"reportId"`
	OrderIndex int    `json:"orderIndex"`
}

type SqliteReportSectionStore struct {
	db *sql.DB
}

func NewSqliteReportSectionStore(db *sql.DB) *SqliteReportStore {
	return &SqliteReportStore{db: db}
}

type ReportSectionStore interface {
	AddReportSection(*ReportSection) (*ReportSection, error)
	GetAllReportSections(filter ReportSectionFilter) ([]*ReportSection, error)
	GetReportSectionById(id string) (*ReportSection, error)
	UpdateReportSection(*ReportSection) error
	DeleteReportSectionById(id string) error
}

type ReportSectionFilter struct {
	ReportId string
}

func (store *SqliteReportStore) AddReportSection(reportSection *ReportSection) (*ReportSection, error) {
	query :=
		`INSERT INTO report_section (id, name, report_id, order_index)
		VALUES ($1, $2, $3, $4)
		RETURNING (id)
		`
	newReportId := uuid.New().String()
	err := store.db.QueryRow(
		query,
		newReportId,
		reportSection.Name,
		reportSection.ReportId,
		reportSection.OrderIndex,
	).Scan(&reportSection.ID)
	if err != nil {
		return nil, err
	}

	return reportSection, nil
}

func (store *SqliteReportStore) GetAllReportSections(filter ReportSectionFilter) ([]*ReportSection, error) {
	query := `
	SELECT id, name, report_id, order_index FROM report_section
	WHERE 1=1
	`
	// NOTE: WHERE 1=1 is a hack that allows you to just add conditions to the statement

	var args []any

	if filter.ReportId != "" {
		query += "AND report_id = ?"
		args = append(args, filter.ReportId)
	}

	var reportSections []*ReportSection

	rows, err := store.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		reportSection := &ReportSection{}
		err := rows.Scan(
			&reportSection.ID,
			&reportSection.Name,
			&reportSection.ReportId,
			&reportSection.OrderIndex,
		)
		if err != nil {
			return nil, err
		}

		reportSections = append(reportSections, reportSection)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return reportSections, nil
}

func (store *SqliteReportStore) GetReportSectionById(id string) (*ReportSection, error) {
	query := `SELECT id, name, report_id, order_index FROM report_section WHERE id = $1`

	reportSection := &ReportSection{}

	err := store.db.QueryRow(query, id).Scan(
		&reportSection.ID,
		&reportSection.Name,
		&reportSection.ReportId,
		&reportSection.OrderIndex,
	)
	if err != nil {
		return nil, err
	}

	return reportSection, nil
}

func (store *SqliteReportStore) UpdateReportSection(reportSection *ReportSection) error {
	query :=
		`UPDATE report_section
		SET name = $1, report_id = $2, order_index = $3
		WHERE id = $4
		`

	res, err := store.db.Exec(
		query,
		reportSection.Name,
		reportSection.ReportId,
		reportSection.OrderIndex,
		reportSection.ID,
	)
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

func (store *SqliteReportStore) DeleteReportSectionById(id string) error {
	query := `DELETE FROM report_section WHERE id = $1`
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
