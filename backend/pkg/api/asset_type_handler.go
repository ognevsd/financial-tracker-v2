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

type AssetTypeHandler struct {
	logger *log.Logger
	store  store.AssetTypeStore
}

func NewAssetTypeHandler(store store.AssetTypeStore, logger *log.Logger) *AssetTypeHandler {
	return &AssetTypeHandler{store: store, logger: logger}
}

func (handler *AssetTypeHandler) AddAssetType(w http.ResponseWriter, r *http.Request) {
	var assetType store.AssetType
	err := json.NewDecoder(r.Body).Decode(&assetType)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddAssetType decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to parse json body: %v", err)})
		return
	}

	createdOperation, err := handler.store.AddAssetType(&assetType)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddAssetType add assetType: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error adding assetType: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"assetType": createdOperation})
}

func (handler *AssetTypeHandler) GetAllAssetTypes(w http.ResponseWriter, r *http.Request) {
	assetTypes, err := handler.store.GetAllAssetTypes()
	if err != nil {
		handler.logger.Printf("ERROR: api:GetAllOperations get assetTypes: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting all opetaions: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"assetType": assetTypes})
}

func (handler *AssetTypeHandler) GetAssetTypeById(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:GetAssetTypeById get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid asset type id"})
		return
	}
	assetType, err := handler.store.GetAssetTypeById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find assetType with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:GetAssetTypeById get assetType from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot get assetType from DB: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"assetType": assetType})
}

func (handler *AssetTypeHandler) UpdateAssetType(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateAssetType get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid asset type id"})
		return
	}
	existingAssetType, err := handler.store.GetAssetTypeById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find operation with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateAssetType get operation from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot get operation from DB: %v", err)})
		return
	}

	var updateAssetType struct {
		ID   *string `json:"id"`
		Name *string `json:"name"`
	}
	err = json.NewDecoder(r.Body).Decode(&updateAssetType)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateAssetType decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to parse json body: %v", err)})
		return
	}

	if updateAssetType.Name != nil {
		existingAssetType.Name = *updateAssetType.Name
	}

	err = handler.store.UpdateAssetType(existingAssetType)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateAssetType update operation: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"assetType": existingAssetType})
}

func (handler *AssetTypeHandler) DeleteAssetType(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:DeleteAssetType get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid asset type id"})
		return
	}
	err = handler.store.DeleteAssetTypeById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "Asset type not found"})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: DeleteCurrency: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error deleting asset type: %v", err)})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
