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
	GetReportFields(*ReportFieldFilter) ([]*ReportField, error)
}

type ReportFieldFilter struct {
	CompanyId string
	ReportId  string
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

func (store *SqliteReportFieldStore) GetReportFields(filter *ReportFieldFilter) ([]*ReportField, error) {
	query := `
	SELECT id, original_name, order_index, report_id, section_id, taxonomy_id
	FROM report_field
	WHERE 1=1
	`
	var args []any

	if filter.CompanyId != "" {
		query += "AND asset_id = ?"
		args = append(args, filter.CompanyId)
	}

	if filter.ReportId != "" {
		query += "AND report_id = ?"
		args = append(args, filter.ReportId)
	}

	var reportFields []*ReportField

	rows, err := store.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		reportField := &ReportField{}
		err := rows.Scan(
			&reportField.Id,
			&reportField.OriginalName,
			&reportField.OrderIndex,
			&reportField.ReportId,
			&reportField.SectionId,
			&reportField.TaxonomyId,
		)
		if err != nil {
			return nil, err
		}
		reportFields = append(reportFields, reportField)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return reportFields, nil
}
