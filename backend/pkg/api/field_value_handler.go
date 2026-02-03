package api

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type FieldValueHandler struct {
	store  store.ReportFieldValueStore
	logger *slog.Logger
}

func NewFieldValueHandler(store store.ReportFieldValueStore, logger *slog.Logger) *FieldValueHandler {
	return &FieldValueHandler{store: store, logger: logger}
}

func (handler *FieldValueHandler) AddFieldValue(w http.ResponseWriter, r *http.Request) {
	var fieldValue store.FieldValue
	err := json.NewDecoder(r.Body).Decode(&fieldValue)
	if err != nil {
		handler.logger.Error("Parse request body", "error", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Error parsing request body: %v", err)})
		return
	}

	createdFieldValue, err := handler.store.AddFieldValue(&fieldValue)
	if err != nil {
		handler.logger.Error("Add Field Value", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to add field value: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"fieldValue": createdFieldValue})
}
