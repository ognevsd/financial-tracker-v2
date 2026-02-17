package store

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

type ReportField struct {
	Id           string  `json:"id"`
	OriginalName string  `json:"name"`
	OrderIndex   int     `json:"orderIndex"`
	ReportId     string  `json:"reportId"`
	SectionId    string  `json:"sectionId"`
	AssetId      string  `json:"assetId"`
	TaxonomyId   *string `json:"taxonomyId"`
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
	FieldExists(id string) (bool, error)
	GetReportFieldById(id string) (*ReportField, error)
	UpdateReportField(reportField *ReportField) error
	DeleteReportField(id string) error
	SwapFields(fieldIdOne string, orderIndexOne int, fieldIdTwo string, orderIndexTwo int) error
}

type ReportFieldFilter struct {
	CompanyId string
	ReportId  string
	SectionId *string
}

func (store *SqliteReportFieldStore) AddReportField(reportField *ReportField) (*ReportField, error) {
	query := `
	INSERT INTO report_field (id, original_name, order_index, report_id, section_id, asset_id, taxonomy_id)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
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
		reportField.AssetId,
		reportField.TaxonomyId,
	).Scan(&reportField.Id)

	if err != nil {
		return nil, err
	}

	return reportField, nil
}

func (s *SqliteReportFieldStore) GetReportFieldById(id string) (*ReportField, error) {
	reportField := &ReportField{}
	query := `
	SELECT id, original_name, order_index, report_id, section_id, asset_id, taxonomy_id
	FROM report_field
	WHERE id = ?
	`

	err := s.db.QueryRow(query, id).Scan(
		&reportField.Id,
		&reportField.OriginalName,
		&reportField.OrderIndex,
		&reportField.ReportId,
		&reportField.SectionId,
		&reportField.AssetId,
		&reportField.TaxonomyId,
	)

	if err != nil {
		return nil, err
	}

	return reportField, nil
}

func (s *SqliteReportFieldStore) SwapFields(fieldIdOne string, orderIndexOne int, fieldIdTwo string, orderIndexTwo int) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
	UPDATE report_field SET order_index = ? WHERE id = ?
	`
	// Updating first field
	_, err = s.db.Exec(query, orderIndexTwo, fieldIdOne)
	if err != nil {
		return err
	}

	// Updating second field
	_, err = s.db.Exec(query, orderIndexOne, fieldIdTwo)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (s *SqliteReportFieldStore) UpdateReportField(reportField *ReportField) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
	UPDATE report_field
	SET original_name = ?, order_index = ?, taxonomy_id = ?
	WHERE id = ?
	`

	res, err := tx.Exec(query, reportField.OriginalName, reportField.OrderIndex, reportField.TaxonomyId, reportField.Id)
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

	return tx.Commit()
}

func (s *SqliteReportFieldStore) DeleteReportField(id string) error {
	query := `
	DELETE FROM report_field WHERE id = ?
	`
	result, err := s.db.Exec(query, id)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (store *SqliteReportFieldStore) FieldExists(id string) (bool, error) {
	var exists bool
	query := `
	SELECT EXISTS(SELECT 1 FROM report_field WHERE id = ?) AS field_exists;
	`
	err := store.db.QueryRow(query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("Error checking if field exists: %w", err)
	}

	return exists, nil
}

func (store *SqliteReportFieldStore) GetReportFields(filter *ReportFieldFilter) ([]*ReportField, error) {
	if filter == nil {
		filter = &ReportFieldFilter{}
	}

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

	if filter.SectionId != nil {
		query += "AND section_id = ?"
		args = append(args, *filter.SectionId)
	}

	query += "ORDER BY order_index ASC"

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
