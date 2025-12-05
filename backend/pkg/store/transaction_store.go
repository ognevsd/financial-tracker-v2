package store

import (
	"database/sql"
	"fmt"

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
}

func (store *SqliteTransactionStore) AddTransaction(transaction *Transaction) (*Transaction, error) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	fmt.Printf("%v\n", transaction)

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
