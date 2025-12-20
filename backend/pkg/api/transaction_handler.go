package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type TransactionHandler struct {
	logger    *log.Logger
	newLogger *slog.Logger
	store     store.TransactionStore
}

func NewTransactionHandler(store store.TransactionStore, logger *log.Logger, newLogger *slog.Logger) *TransactionHandler {
	return &TransactionHandler{store: store, logger: logger, newLogger: newLogger}
}

func (handler *TransactionHandler) AddTransaction(w http.ResponseWriter, r *http.Request) {
	var transaction store.Transaction
	err := json.NewDecoder(r.Body).Decode(&transaction)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddTransaction decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot parse request body: %v", err)})
		return
	}
	handler.newLogger.Info("Adding transaction", "transaction", transaction)

	createdTransaction, err := handler.store.AddTransaction(&transaction)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddTransaction add transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot add transaction: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transaction": createdTransaction})

}

func (handler *TransactionHandler) GetAllTransactions(w http.ResponseWriter, r *http.Request) {
	allTransactions, err := handler.store.GetAllTransactions()
	if err != nil {
		handler.logger.Printf("ERROR: api:GetAllTransactions decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting all transactions: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transaction": allTransactions})
}

func (handler *TransactionHandler) GetTransactionById(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:GetTransactionById get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting id from slug: %v", err)})
		return
	}
	handler.newLogger.Info("Getting transaction with id", "id", id)
	transaction, err := handler.store.GetTransactionById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Transaction with id: %v not found", err)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:GetTransactionById get transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting transaction: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transaction": transaction})
}

func (handler *TransactionHandler) UpdateTransaction(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateTransaction get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting id from slug: %v", err)})
		return
	}
	existingTransaction, err := handler.store.GetTransactionById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Transaction with id: %v not found", err)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateTransaction get transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting transaction: %v", err)})
		return
	}

	var updatedTransaction struct {
		ID        *string  `json:"id"`
		Operation *string  `json:"operation"`
		Date      *string  `json:"date"`
		Ticker    *string  `json:"ticker"`
		Type      *string  `json:"type"`
		Quantity  *int     `json:"quantity"`
		Price     *float64 `json:"price"`
		Currency  *string  `json:"currency"`
		Note      *string  `json:"note"`
	}
	err = json.NewDecoder(r.Body).Decode(&updatedTransaction)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateTransaction decode updated transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting transaction: %v", err)})
		return
	}

	if updatedTransaction.Operation != nil {
		existingTransaction.Operation = *updatedTransaction.Operation
	}
	if updatedTransaction.Date != nil {
		existingTransaction.Date = *updatedTransaction.Date
	}
	if updatedTransaction.Ticker != nil {
		existingTransaction.Ticker = *updatedTransaction.Ticker
	}
	if updatedTransaction.Type != nil {
		existingTransaction.Type = *updatedTransaction.Type
	}
	if updatedTransaction.Quantity != nil {
		existingTransaction.Quantity = *updatedTransaction.Quantity
	}
	if updatedTransaction.Price != nil {
		existingTransaction.Price = *updatedTransaction.Price
	}
	if updatedTransaction.Currency != nil {
		existingTransaction.Currency = *updatedTransaction.Currency
	}
	if updatedTransaction.Note != nil {
		existingTransaction.Note = *updatedTransaction.Note
	}

	err = handler.store.UpdateTransaction(existingTransaction)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateTransaction update transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error updating transaction: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transaction": existingTransaction})
}

func (handler *TransactionHandler) DeleteTransactionById(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:DeleteTransactionById get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting id from slug: %v", err)})
		return
	}
	err = handler.store.DeleteTransactionById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "Operation not found"})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:DeleteTransactionById delete transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error deleting operation: %v", err)})
		return
	}

	w.WriteHeader(http.StatusNoContent)

}
