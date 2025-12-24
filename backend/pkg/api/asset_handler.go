package api

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type AssetHandler struct {
	store  store.AssetStore
	logger *slog.Logger
}

func NewAssetHandler(store store.AssetStore, logger *slog.Logger) *AssetHandler {
	return &AssetHandler{store: store, logger: logger}
}

func (handler *AssetHandler) AddAsset(w http.ResponseWriter, r *http.Request) {
	var asset store.Asset
	err := json.NewDecoder(r.Body).Decode(&asset)
	if err != nil {
		handler.logger.Error("Decode request body", "error", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload(fmt.Sprintf("Error when parsig request body: %v", err)))
		return
	}

	createdAsset, err := handler.store.AddAsset(&asset)
	if err != nil {
		handler.logger.Error("Add asset to DB", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error adding asset to DB: %v", err)))
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"asset": createdAsset})
}

func (handler *AssetHandler) GetAllAssets(w http.ResponseWriter, r *http.Request) {
	assets, err := handler.store.GetAllAssets()
	if err != nil {
		handler.logger.Error("Get all assets", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Cannot get assets from DB: %v", err)))
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"asset": assets})
}
