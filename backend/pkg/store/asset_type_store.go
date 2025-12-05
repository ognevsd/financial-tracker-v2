package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type AssetType struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SqliteAssetTypeStore struct {
	db *sql.DB
}

func NewAssetTypeStore(db *sql.DB) *SqliteAssetTypeStore {
	return &SqliteAssetTypeStore{db: db}
}

type AssetTypeStore interface {
	AddAssetType(*AssetType) (*AssetType, error)
	GetAssetTypeById(id string) (*AssetType, error)
	GetAllAssetTypes() ([]*AssetType, error)
	UpdateAssetType(*AssetType) error
	DeleteAssetTypeById(id string) error
}

func (store *SqliteAssetTypeStore) AddAssetType(assetType *AssetType) (*AssetType, error) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query :=
		`INSERT INTO asset_type (id, name)
		VALUES ($1, $2)
		RETURNING id
		`
	newOpId := uuid.New().String()
	err = tx.QueryRow(query, newOpId, assetType.Name).Scan(&assetType.ID)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return assetType, nil
}

func (store *SqliteAssetTypeStore) GetAssetTypeById(id string) (*AssetType, error) {
	assetType := &AssetType{}
	query :=
		`SELECT id, name
		FROM asset_type
		WHERE id = $1
		`

	err := store.db.QueryRow(query, id).Scan(&assetType.ID, &assetType.Name)
	if err != nil {
		return nil, err
	}

	return assetType, nil
}

func (store *SqliteAssetTypeStore) GetAllAssetTypes() ([]*AssetType, error) {
	query := `SELECT id, name FROM asset_type`
	var operations []*AssetType

	rows, err := store.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		op := &AssetType{}
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

func (store *SqliteAssetTypeStore) UpdateAssetType(assetType *AssetType) error {
	tx, err := store.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query :=
		`UPDATE asset_type
		SET name = $1
		WHERE id = $2
		`

	res, err := tx.Exec(query, assetType.Name, assetType.ID)
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

func (store *SqliteAssetTypeStore) DeleteAssetTypeById(id string) error {
	query := `DELETE FROM asset_type WHERE id = $1`
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
