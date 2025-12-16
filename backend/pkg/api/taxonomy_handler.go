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

type TaxonomyHandler struct {
	logger *log.Logger
	store  store.TaxonomyStore
}

func NewTaxonomyHandler(store store.TaxonomyStore, logger *log.Logger) *TaxonomyHandler {
	return &TaxonomyHandler{store: store, logger: logger}
}

func (handler *TaxonomyHandler) AddTaxonomy(w http.ResponseWriter, r *http.Request) {
	var taxonomy store.Taxonomy
	err := json.NewDecoder(r.Body).Decode(&taxonomy)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddTaxonomy decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to parse json body: %v", err)})
		return
	}

	createdTaxonomy, err := handler.store.AddTaxonomy(&taxonomy)
	if err != nil {
		handler.logger.Printf("ERROR: api:AddTaxonomy add taxonomy: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error adding taxonomy: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"taxonomy": createdTaxonomy})
}

func (handler *TaxonomyHandler) GetAllTaxonomies(w http.ResponseWriter, r *http.Request) {
	taxonomies, err := handler.store.GetAllTaxonomies()
	if err != nil {
		handler.logger.Printf("ERROR: api:GetAllTaxonomies get assetTypes: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting all taxonomies: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"taxonomy": taxonomies})
}

func (handler *TaxonomyHandler) GetTaxonomyById(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:GetTaxonomyById get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid taxonomy id"})
		return
	}
	taxonomy, err := handler.store.GetTaxonomyById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find taxonomy with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:GetTaxonomyById get taxonomy from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot get taxonomy from DB: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"taxonomy": taxonomy})
}

func (handler *TaxonomyHandler) UpdateTaxonomy(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateTaxonomy get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid taxonomy id"})
		return
	}
	existingTaxonomy, err := handler.store.GetTaxonomyById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find taxonomy with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateTaxonomy get taxonomy from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Cannot get taxonomy from DB: %v", err)})
		return
	}

	var updateTaxonomy struct {
		ID          *string `json:"id"`
		Name        *string `json:"name"`
		Description *string `json:"description"`
		ReportId    *string `json:"reportId"`
	}
	err = json.NewDecoder(r.Body).Decode(&updateTaxonomy)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateTaxonomy decode json: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Failed to parse json body: %v", err)})
		return
	}

	if updateTaxonomy.Name != nil {
		existingTaxonomy.Name = *updateTaxonomy.Name
	}
	if updateTaxonomy.Description != nil {
		existingTaxonomy.Description = *updateTaxonomy.Description
	}
	if updateTaxonomy.ReportId != nil {
		existingTaxonomy.ReportId = *updateTaxonomy.ReportId
	}

	err = handler.store.UpdateTaxonomy(existingTaxonomy)
	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateTaxonomy update taxonomy: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"taxonomy": existingTaxonomy})
}

func (handler *TaxonomyHandler) DeleteTaxonomy(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:DeleteTaxonomy get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid taxonomy id"})
		return
	}
	err = handler.store.DeleteTaxonomyById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "Taxonomy not found"})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: DeleteTaxonomy: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error deleting taxonomy: %v", err)})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
