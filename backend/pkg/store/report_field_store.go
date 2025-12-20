package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type ReportField struct {
	Id           string `json:"id"`
	OriginalName string `json:"originalName"`
	OrderIndex   int    `json:"orderIndex"`
	ReportId     string `json:"reportId"`
	SectionId    string `json:"sectionId"`
	TaxonomyId   string `json:"taxonomyId"`
}

type SqliteReportFieldStore struct {
	db *sql.DB
}

func NewSqliteReportFieldStore(db *sql.DB) *SqliteReportFieldStore {
	return &SqliteReportFieldStore{db: db}
}

type ReportFieldStore interface {
	AddReportField(*ReportField) (*ReportField, error)
}

func (store *SqliteReportFieldStore) AddReportField(reportField *ReportField) (*ReportField, error) {
	query := `
	INSERT INTO report_field (id, original_name, order_index, report_id, section_id, taxonomy_id)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING (id)
	`

	newReportFieldId := uuid.New().String()
	err := store.db.QueryRow(
		query,
		newReportFieldId,
		reportField.OriginalName,
		reportField.OrderIndex,
		reportField.ReportId,
		reportField.SectionId,
		reportField.TaxonomyId,
	).Scan(&reportField.Id)

	if err != nil {
		return nil, err
	}

	return reportField, nil
}
