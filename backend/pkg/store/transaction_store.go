package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type Transaction struct {
	ID        string  `json:"id"`
	Operation string  `json:"operation"`
	Date      string  `json:"date"`
	Ticker    string  `json:"ticker"`
	Type      string  `json:"type"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
	Currency  string  `json:"currency"`
	Note      string  `json:"note"`
}

type SqliteTransactionStore struct {
	db *sql.DB
}

func NewSqliteTransactionStore(db *sql.DB) *SqliteTransactionStore {
	return &SqliteTransactionStore{db: db}
}

type TransactionStore interface {
	AddTransaction(*Transaction) (*Transaction, error)
	GetAllTransactions() ([]*Transaction, error)
	GetTransactionById(id string) (*Transaction, error)
	UpdateTransaction(*Transaction) error
}

func (store *SqliteTransactionStore) AddTransaction(transaction *Transaction) (*Transaction, error) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query :=
		`INSERT INTO "transaction" (id, operation_id, ticker, date, type, quantity, price, currency_id, note)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
		`
	newTransactionId := uuid.New().String()
	err = tx.QueryRow(
		query,
		newTransactionId,
		transaction.Operation,
		transaction.Ticker,
		transaction.Date,
		transaction.Type,
		transaction.Quantity,
		transaction.Price,
		transaction.Currency,
		transaction.Note,
	).Scan(&transaction.ID)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}
	return transaction, nil
}

func (store *SqliteTransactionStore) GetAllTransactions() ([]*Transaction, error) {
	query :=
		`SELECT id, operation_id, ticker, date, type, quantity, price, currency_id, note
		FROM "transaction"
		`

	rows, err := store.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []*Transaction

	for rows.Next() {
		transaction := &Transaction{}
		err := rows.Scan(
			&transaction.ID,
			&transaction.Operation,
			&transaction.Ticker,
			&transaction.Date,
			&transaction.Type,
			&transaction.Quantity,
			&transaction.Price,
			&transaction.Currency,
			&transaction.Note,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return transactions, nil
}

func (store *SqliteTransactionStore) GetTransactionById(id string) (*Transaction, error) {
	transaction := &Transaction{}
	query :=
		`SELECT id, operation_id, ticker, date, type, quantity, price, currency_id, note
		FROM "transaction"
		WHERE id = $1
		`

	err := store.db.QueryRow(query, id).Scan(
		&transaction.ID,
		&transaction.Operation,
		&transaction.Ticker,
		&transaction.Date,
		&transaction.Type,
		&transaction.Quantity,
		&transaction.Price,
		&transaction.Currency,
		&transaction.Note,
	)
	if err != nil {
		return nil, err
	}

	return transaction, nil
}

func (store *SqliteTransactionStore) UpdateTransaction(transaction *Transaction) error {
	tx, err := store.db.Begin()
	if err != nil {
		return nil
	}
	defer tx.Rollback()

	query :=
		`UPDATE "transaction"
		SET operation_id = $1, ticker = $2, date = $3, type = $4, quantity = $5, price = $6, currency_id = $7, note = $8
		WHERE id = $9
		`

	result, err := tx.Exec(
		query,
		transaction.Operation,
		transaction.Ticker,
		transaction.Date,
		transaction.Type,
		transaction.Quantity,
		transaction.Price,
		transaction.Currency,
		transaction.Note,
		transaction.ID,
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

func (store *SqliteTransactionStore) DeleteTransactionById(id string) error {
	query := `DELETE FROM "transaction" WHERE id = $1`
	result, err := store.db.Exec(query, id)
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
