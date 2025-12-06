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
	GetAllCurrencies() ([]*Currency, error)
	UpdateCurrency(*Currency) error
	DeleteCurrency(id string) error
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
	query :=
		`SELECT id, code, name, decimals
		FROM currency
		WHERE id = $1
		`

	err := sqlite.db.QueryRow(query, id).Scan(
		&currecny.ID,
		&currecny.Code,
		&currecny.Name,
		&currecny.Decimals,
	)
	if err != nil {
		return nil, err
	}

	return currecny, nil
}

func (sqlite *SqliteCurrencyStore) GetAllCurrencies() ([]*Currency, error) {
	query := `SELECT id, code, name, decimals FROM currency ORDER BY name ASC`
	rows, err := sqlite.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var currencies []*Currency

	for rows.Next() {
		cur := &Currency{}
		err := rows.Scan(&cur.ID, &cur.Code, &cur.Name, &cur.Decimals)
		if err != nil {
			return nil, err
		}
		currencies = append(currencies, cur)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return currencies, nil
}

func (sqlite *SqliteCurrencyStore) UpdateCurrency(currency *Currency) error {
	tx, err := sqlite.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query :=
		`UPDATE currency
		SET code = $1, name = $2, decimals = $3
		WHERE id = $4
		`
	result, err := tx.Exec(
		query,
		currency.Code,
		currency.Name,
		currency.Decimals,
		currency.ID,
	)

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

	return tx.Commit()
}

func (sqlite *SqliteCurrencyStore) DeleteCurrency(id string) error {
	query :=
		`DELETE FROM currency
		WHERE id = $1
		`
	result, err := sqlite.db.Exec(query, id)
	if err != nil {
		return err
	}
	rowsAffected, nil := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
