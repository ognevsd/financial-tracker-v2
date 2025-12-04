package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type Operation struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SqliteOperationStore struct {
	db *sql.DB
}

func NewOperationStore(db *sql.DB) *SqliteOperationStore {
	return &SqliteOperationStore{db: db}
}

type OperationStore interface {
	AddOperation(*Operation) (*Operation, error)
	GetOperationById(id string) (*Operation, error)
	GetAllOperations() ([]*Operation, error)
	UpdateOperation(*Operation) error
	DeleteOperationById(id string) error
}

func (store *SqliteOperationStore) AddOperation(operation *Operation) (*Operation, error) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query :=
		`INSERT INTO operation (id, name)
		VALUES ($1, $2)
		RETURNING id
		`
	newOpId := uuid.New().String()
	err = tx.QueryRow(query, newOpId, operation.Name).Scan(&operation.ID)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return operation, nil
}

func (store *SqliteOperationStore) GetOperationById(id string) (*Operation, error) {
	operation := &Operation{}
	query :=
		`SELECT id, name
		FROM operation
		WHERE id = $1
		`

	err := store.db.QueryRow(query, id).Scan(&operation.ID, &operation.Name)
	if err != nil {
		return nil, err
	}

	return operation, nil
}

func (store *SqliteOperationStore) GetAllOperations() ([]*Operation, error) {
	query := `SELECT id, name FROM operation`
	var operations []*Operation

	rows, err := store.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		op := &Operation{}
		err := rows.Scan(&op.ID, &op.Name)
		if err != nil {
			return nil, err
		}
		operations = append(operations, op)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return operations, nil
}

func (store *SqliteOperationStore) UpdateOperation(operation *Operation) error {
	tx, err := store.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query :=
		`UPDATE operation
		SET name = $1
		WHERE id = $2
		`

	res, err := tx.Exec(query, operation.Name, operation.ID)
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

func (store *SqliteOperationStore) DeleteOperationById(id string) error {
	query := `DELETE FROM operation WHERE id = $1`
	result, err := store.db.Exec(query, id)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
