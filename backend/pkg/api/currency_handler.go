package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
)

type CurrencyHandler struct {
	currencyStore store.CurrencyStore
}

func NewCurrencyHandler(currencyStore store.CurrencyStore) *CurrencyHandler {
	return &CurrencyHandler{
		currencyStore: currencyStore,
	}
}

func (ch *CurrencyHandler) HandleAddCurrency(w http.ResponseWriter, r *http.Request) {
	var currency store.Currency
	err := json.NewDecoder(r.Body).Decode(&currency)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to add currency", http.StatusInternalServerError)
		return
	}

	createdCurrency, err := ch.currencyStore.AddCurrency(&currency)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to add currency", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdCurrency)
}

func (ch *CurrencyHandler) GetAllCurrencies(w http.ResponseWriter, r *http.Request) {
	currencies, err := ch.currencyStore.GetAllCurrencies()
	if err != nil {
		fmt.Println("ERROR: GetAllCurrencies: %w", err)
		http.Error(w, "Failed to get all currencies", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(currencies)
}
