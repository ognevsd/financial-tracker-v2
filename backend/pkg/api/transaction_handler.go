package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type TransactionHandler struct {
	logger *log.Logger
	store  store.TransactionStore
}

func NewTransactionHandler(store store.TransactionStore, logger *log.Logger) *TransactionHandler {
	return &TransactionHandler{store: store, logger: logger}
}

func (handler *TransactionHandler) AddTransaction(w http.ResponseWriter, r *http.Request) {
	var transaction store.Transaction
	err := json.NewDecoder(r.Body).Decode(&transaction)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddTransaction decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot parse request body: %v", err)})
		return
	}

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
