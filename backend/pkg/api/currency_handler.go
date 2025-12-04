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
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to parse json body: %v", err)})
		return
	}

	createdCurrency, err := ch.currencyStore.AddCurrency(&currency)
	if err != nil {
		ch.logger.Printf("ERROR: HandleAddCurrency: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to add currency: %v", err)})
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

func (ch *CurrencyHandler) UpdateCurrency(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		ch.logger.Printf("ERROR: UpdateCurrency: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid currency id"})
		return
	}
	existingCurrency, err := ch.currencyStore.GetCurrencyById(id)
	if err == sql.ErrNoRows {
		ch.logger.Printf("ERROR: UpdateCurrency: %v", err)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "Currency not found"})
		return
	}
	if err != nil {
		ch.logger.Printf("ERROR: UpdateCurrency: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
		return
	}

	// All values are as pointers cause it allows to check if values are nil or empty
	// e.g. default value for string is "", if "" is recieved, does it mean that
	// there was no change or that user wants an empty field?
	var updateCurrencyRequest struct {
		ID       *string `json:"id"`
		Code     *string `json:"code"`
		Name     *string `json:"name"`
		Decimals *int    `json:"decimals"`
	}

	err = json.NewDecoder(r.Body).Decode(&updateCurrencyRequest)
	if err != nil {
		ch.logger.Printf("ERROR: UpdateCurrency: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid request payload"})
		return
	}

	if updateCurrencyRequest.Code != nil {
		existingCurrency.Code = *updateCurrencyRequest.Code
	}
	if updateCurrencyRequest.Name != nil {
		existingCurrency.Name = *updateCurrencyRequest.Name
	}
	if updateCurrencyRequest.Decimals != nil {
		existingCurrency.Decimals = *updateCurrencyRequest.Decimals
	}

	err = ch.currencyStore.UpdateCurrency(existingCurrency)
	if err != nil {
		ch.logger.Printf("ERROR: UpdateCurrecny: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Internal server error"})
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"currency": existingCurrency})
}
