package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type Currency struct {
	ID       string `json:"id"`
	Code     string `json:"code"`
	Name     string `json:"name"`
	Decimals int    `json:"decimals"`
}

type SqliteCurrencyStore struct {
	db *sql.DB
}

func NewSqliteCurrencyStore(db *sql.DB) *SqliteCurrencyStore {
	return &SqliteCurrencyStore{db: db}
}

type CurrencyStore interface {
	AddCurrency(*Currency) (*Currency, error)
	GetCurrencyById(id string) (*Currency, error)
}

func (sqlite *SqliteCurrencyStore) AddCurrency(cur *Currency) (*Currency, error) {
	tx, err := sqlite.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query :=
		`INSERT INTO currency (id, code, name, decimals)
		VALUES ($1, $2, $3, $4)
		RETURNING id`

	newCurId := uuid.New().String()
	err = tx.QueryRow(
		query,
		newCurId,
		cur.Code,
		cur.Name,
		cur.Decimals,
	).Scan(&cur.ID)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return cur, nil
}

func (sqlite *SqliteCurrencyStore) GetCurrencyById(id string) (*Currency, error) {
	currecny := &Currency{}
	return currecny, nil
}
