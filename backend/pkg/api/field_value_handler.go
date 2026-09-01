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
	var requestBody struct {
		FieldId string `json:"fieldId"`
		Year    int    `json:"year"`
		Value   *int   `json:"value"`
	}
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		handler.logger.Error("Parse request body", "error", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Error parsing request body: %v", err)})
		return
	}

	handler.logger.Info("Received field value", "value", requestBody)
	// TODO: Field value already exists. It was added when year was added (all values are null)
	// In this function I need to just update the value
	// 1. Query the fieldValue id
	// 2. Update value by id

	fieldValue, err := handler.store.GetFieldValueByFieldIdAndYear(requestBody.FieldId, requestBody.Year)
	if err != nil {
		handler.logger.Error("Search for db entry", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Search for DB entry: %v", err)))
		return
	}
	if requestBody.Value != nil {
		err = handler.store.UpdateFieldValue(fieldValue.Id, *requestBody.Value)
		if err != nil {
			handler.logger.Error("Update field value", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Update field value: %v", err)))
			return
		}
	}

	// utils.WriteJSON(w, http.StatusOK, utils.Envelope{"fieldValue": createdFieldValue})
}
