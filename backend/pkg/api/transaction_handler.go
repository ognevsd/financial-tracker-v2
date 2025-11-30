package api

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type TransactionHandler struct{}

func NewTransactionHandler() *TransactionHandler {
	return &TransactionHandler{}
}

func (th *TransactionHandler) HandleGetTransactionById(w http.ResponseWriter, r *http.Request) {
	paramsTransactionId := chi.URLParam(r, "id")
	if paramsTransactionId == "" {
		http.NotFound(w, r)
		return
	}

	fmt.Fprintf(w, "Transaction id: %s\n", paramsTransactionId)
}

func (th *TransactionHandler) HandleAddTransaction(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Transaction added\n")
}
