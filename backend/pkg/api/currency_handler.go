package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type CurrencyHandler struct {
	currencyStore store.CurrencyStore
	logger        *log.Logger
}

func NewCurrencyHandler(currencyStore store.CurrencyStore, logger *log.Logger) *CurrencyHandler {
	return &CurrencyHandler{
		currencyStore: currencyStore,
		logger:        logger,
	}
}

func (ch *CurrencyHandler) HandleAddCurrency(w http.ResponseWriter, r *http.Request) {
	var currency store.Currency
	err := json.NewDecoder(r.Body).Decode(&currency)
	if err != nil {
		fmt.Println(err)
		ch.logger.Printf("ERROR: HandleAddCurrency: %v", err)
		http.Error(w, "Failed to add currency", http.StatusInternalServerError)
		return
	}

	createdCurrency, err := ch.currencyStore.AddCurrency(&currency)
	if err != nil {
		ch.logger.Printf("ERROR: HandleAddCurrency: %v", err)
		http.Error(w, "Failed to add currency", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdCurrency)
}

func (ch *CurrencyHandler) GetAllCurrencies(w http.ResponseWriter, r *http.Request) {
	currencies, err := ch.currencyStore.GetAllCurrencies()
	if err != nil {
		ch.logger.Printf("ERROR: GetAllCurrencies: %v", err)
		http.Error(w, "Failed to get all currencies", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(currencies)
}

func (ch *CurrencyHandler) GetCurrencyById(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		ch.logger.Printf("ERROR: GetCurrencyById: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid currency id"})
		return
	}
	currency, err := ch.currencyStore.GetCurrencyById(id)
	if err == sql.ErrNoRows {
		ch.logger.Printf("ERROR: GetCurrencyById: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Currency with id: %s not found", id)})
		return

	}
	if err != nil {
		ch.logger.Printf("ERROR: GetCurrencyById: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid currency id"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"currency": currency})

}

// func (ch *CurrencyHandler) UpdateCurrency(w http.ResponseWriter, r *http.Request) {
// 	var currency store.Currency
// 	err := json.NewDecoder(r.Body).Decode(&currency)
// 	if err != nil {
// 		fmt.Println(err)
// 		http.Error(w, "Failed to update currency", http.StatusInternalServerError)
// 		return
// 	}
//
// 	w.Header().S
// }
