package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type FieldValue struct {
	Id      string `json:"id"`
	FieldId string `json:"fieldId"`
	Year    int    `json:"year"`
	Value   *int   `json:"value"`
}

type SqliteFieldValueStore struct {
	db *sql.DB
}

func NewSqliteFieldValueStore(db *sql.DB) *SqliteFieldValueStore {
	return &SqliteFieldValueStore{db: db}
}

type ReportFieldValueStore interface {
	AddFieldValue(*FieldValue) (*FieldValue, error)
	GetFieldValueByFieldId(fieldId string) ([]*FieldValue, error)
	GetFieldValueByFieldIdAndYear(fieldId string, year int) (*FieldValue, error)
	UpdateFieldValue(fieldValueId string, year int) error
	DeleteFieldValueByFieldId(fieldId string) error
	ChangeYear(companyId string, reportId string, year int, prevYear int) error
	DeleteYear(companyId string, reportId string, year int) error
}

func (store *SqliteFieldValueStore) AddFieldValue(fieldValue *FieldValue) (*FieldValue, error) {
	query := `
		INSERT INTO field_value (id, field_id, year, value)
		VALUES ($1, $2, $3, $4)
		RETURNING (id)
		`
	newFieldValueId := uuid.New().String()
	err := store.db.QueryRow(query, newFieldValueId, fieldValue.FieldId, fieldValue.Year, fieldValue.Value).Scan(&fieldValue.Id)
	if err != nil {
		return nil, err
	}

	return fieldValue, nil
}

func (store *SqliteFieldValueStore) GetFieldValueByFieldId(fieldId string) ([]*FieldValue, error) {
	query := `
	SELECT id, field_id, year, value
	FROM field_value
	WHERE field_id = $1
	ORDER BY year DESC;
	`

	var fieldValues []*FieldValue

	rows, err := store.db.Query(query, fieldId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		fieldValue := &FieldValue{}
		err := rows.Scan(&fieldValue.Id, &fieldValue.FieldId, &fieldValue.Year, &fieldValue.Value)
		if err != nil {
			return nil, err
		}
		fieldValues = append(fieldValues, fieldValue)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return fieldValues, nil
}

func (store *SqliteFieldValueStore) GetFieldValueByFieldIdAndYear(fieldId string, year int) (*FieldValue, error) {
	query := `
	SELECT id, field_id, year, value
	FROM field_value
	WHERE field_id = ? AND year = ?
	ORDER BY year DESC;
	`

	fieldValue := &FieldValue{}

	err := store.db.QueryRow(query, fieldId, year).Scan(
		&fieldValue.Id,
		&fieldValue.FieldId,
		&fieldValue.Year,
		&fieldValue.Value,
	)
	if err != nil {
		return nil, err
	}

	return fieldValue, nil
}

func (store *SqliteFieldValueStore) UpdateFieldValue(fieldValueId string, value int) error {
	query := `
	UPDATE field_value
	SET value = $1
	WHERE id = $2
	`

	res, err := store.db.Exec(query, value, fieldValueId)
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

func (store *SqliteFieldValueStore) DeleteFieldValueByFieldId(fieldId string) error {
	query := `
	DELETE FROM field_value
	WHERE field_id = $1
	`
	res, err := store.db.Exec(query, fieldId)
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

func (s *SqliteFieldValueStore) ChangeYear(companyId string, reportId string, year int, prevYear int) error {
	query := `
	UPDATE field_value
	SET year = ?, updated_at = current_timestamp
	WHERE year = ?
		AND field_id IN (
			SELECT rf.id FROM report_field rf
			WHERE rf.report_id = ? AND rf.asset_id = ?
		)
	`
	res, err := s.db.Exec(query, year, prevYear, reportId, companyId)
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

func (s *SqliteFieldValueStore) DeleteYear(companyId string, reportId string, year int) error {
	query := `
	DELETE FROM field_value
	WHERE year = ?
	AND field_id IN (
		SELECT rf.id FROM report_field rf
		WHERE rf.report_id = ? AND rf.asset_id = ?
	)
	`

	res, err := s.db.Exec(query, year, reportId, companyId)
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
