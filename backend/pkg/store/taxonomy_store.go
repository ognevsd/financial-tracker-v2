package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type Taxonomy struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SqliteTaxonomyStore struct {
	db *sql.DB
}

func NewTaxonomyStore(db *sql.DB) *SqliteTaxonomyStore {
	return &SqliteTaxonomyStore{db: db}
}

type TaxonomyStore interface {
	AddTaxonomy(*Taxonomy) (*Taxonomy, error)
	GetTaxonomyById(id string) (*Taxonomy, error)
	GetAllTaxonomies() ([]*Taxonomy, error)
	UpdateTaxonomy(*Taxonomy) error
	DeleteTaxonomyById(id string) error
}

func (store *SqliteTaxonomyStore) AddTaxonomy(taxonomy *Taxonomy) (*Taxonomy, error) {
	query :=
		`INSERT INTO taxonomy (id, name)
		VALUES ($1, $2)
		RETURNING id
		`
	newTaxonomyId := uuid.New().String()
	err := store.db.QueryRow(query, newTaxonomyId, taxonomy.Name).Scan(&taxonomy.ID)
	if err != nil {
		return nil, err
	}

	return taxonomy, nil
}

func (store *SqliteTaxonomyStore) GetTaxonomyById(id string) (*Taxonomy, error) {
	taxonomy := &Taxonomy{}
	query :=
		`SELECT id, name
		FROM taxonomy
		WHERE id = $1
		`

	err := store.db.QueryRow(query, id).Scan(&taxonomy.ID, &taxonomy.Name)
	if err != nil {
		return nil, err
	}

	return taxonomy, nil
}

func (store *SqliteTaxonomyStore) GetAllTaxonomies() ([]*Taxonomy, error) {
	query := `SELECT id, name FROM taxonomy`
	var operations []*Taxonomy

	rows, err := store.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		op := &Taxonomy{}
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

func (store *SqliteTaxonomyStore) UpdateTaxonomy(taxonomy *Taxonomy) error {
	tx, err := store.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query :=
		`UPDATE taxonomy
		SET name = $1
		WHERE id = $2
		`

	res, err := tx.Exec(query, taxonomy.Name, taxonomy.ID)
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

func (store *SqliteTaxonomyStore) DeleteTaxonomyById(id string) error {
	query := `DELETE FROM taxonomy WHERE id = $1`
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
