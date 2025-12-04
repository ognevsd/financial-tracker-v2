package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type OperationHandler struct {
	logger *log.Logger
	store  store.OperationStore
}

func NewOperationHandler(store store.OperationStore, logger *log.Logger) *OperationHandler {
	return &OperationHandler{store: store, logger: logger}
}

func (handler *OperationHandler) AddOperation(w http.ResponseWriter, r *http.Request) {
	var operation store.Operation
	err := json.NewDecoder(r.Body).Decode(&operation)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddOperation decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to parse json body: %v", err)})
		return
	}

	operation.Name = strings.ToUpper(operation.Name)

	createdOperation, err := handler.store.AddOperation(&operation)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddOperation add operation: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error adding operation: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"operation": createdOperation})
}

func (handler *OperationHandler) GetAllOperations(w http.ResponseWriter, r *http.Request) {
	operations, err := handler.store.GetAllOperations()
	if err != nil {
		handler.logger.Printf("ERROR: api:GetAllOperations get operations: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting all opetaions: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"operation": operations})
}

func (handler *OperationHandler) GetOperationById(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:GetOperationById get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid operaion id"})
		return
	}
	operation, err := handler.store.GetOperationById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find operation with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:GetOperationById get operation from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot get operation from DB: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"operation": operation})
}

func (handler *OperationHandler) UpdateOperation(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateOperation get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid operaion id"})
		return
	}
	existingOperation, err := handler.store.GetOperationById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find operation with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateOperation get operation from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot get operation from DB: %v", err)})
		return
	}

	var updateOperation struct {
		ID   *string `json:"id"`
		Name *string `json:"name"`
	}
	err = json.NewDecoder(r.Body).Decode(&updateOperation)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateOperation decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to parse json body: %v", err)})
		return
	}

	if updateOperation.Name != nil {
		existingOperation.Name = strings.ToUpper(*updateOperation.Name)
	}

	err = handler.store.UpdateOperation(existingOperation)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateOperation update operation: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"operation": existingOperation})
}

func (handler *OperationHandler) DeleteOperation(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:DeleteOperation get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid operaion id"})
		return
	}
	err = handler.store.DeleteOperationById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "Operation not found"})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: DeleteCurrency: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error deleting operation: %v", err)})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
