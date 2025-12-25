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

type ReportSectionHandler struct {
	logger *log.Logger
	store  store.ReportSectionStore
}

func NewReportSectionHandler(store store.ReportSectionStore, logger *log.Logger) *ReportSectionHandler {
	return &ReportSectionHandler{store: store, logger: logger}
}

func (handler *ReportSectionHandler) AddReportSection(w http.ResponseWriter, r *http.Request) {
	var reportSection store.ReportSection
	err := json.NewDecoder(r.Body).Decode(&reportSection)
	if err != nil {
		handler.logger.Printf("ERROR api:AddReportSection decode request body: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error parsing request body: %v", err)})
		return
	}

	createdReportSection, err := handler.store.AddReportSection(&reportSection)
	if err != nil {
		handler.logger.Printf("ERROR api:AddReport create report in db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error adding report to DB: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"reportSection": createdReportSection})
}

func (handler *ReportSectionHandler) GetAllReportSections(w http.ResponseWriter, r *http.Request) {
	filter := store.ReportSectionFilter{
		ReportId: r.URL.Query().Get("reportId"),
	}
	reportSections, err := handler.store.GetAllReportSections(filter)
	if err != nil {
		handler.logger.Printf("ERROR api:GetAllReportSections get reportSections from DB: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting reportSections from DB: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"reportSection": reportSections})
}

func (handler *ReportSectionHandler) GetReportSectionById(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR api:GetReportSectionById get id param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Error parsing id from url: %v", err)})
		return
	}
	report, err := handler.store.GetReportSectionById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find report section with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR api:GetReportSectionById get report from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Internal error: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"reportSection": report})
}

func (handler *ReportSectionHandler) UpdateReportSection(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR api:UpdateReportSection get id param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Error parsing id from url: %v", err)})
		return
	}
	reportSection, err := handler.store.GetReportSectionById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find report section with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR api:GetReportSectionById get report from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Internal error: %v", err)})
		return
	}

	var updatedReportSection struct {
		ID         *string `json:"id"`
		Name       *string `json:"name"`
		ReportId   *string `json:"reportId"`
		OrderIndex *int    `json:"orderIndex"`
	}
	err = json.NewDecoder(r.Body).Decode(&updatedReportSection)
	if err != nil {
		handler.logger.Printf("ERROR api:UpdateReport parse request body: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Error parsing request body: %v", err)})
		return
	}

	if updatedReportSection.Name != nil {
		reportSection.Name = *updatedReportSection.Name
	}
	if updatedReportSection.ReportId != nil {
		reportSection.ReportId = *updatedReportSection.ReportId
	}
	if updatedReportSection.OrderIndex != nil {
		reportSection.OrderIndex = *updatedReportSection.OrderIndex
	}

	err = handler.store.UpdateReportSection(reportSection)

	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateReportSection update operation: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"reportSection": reportSection})
}

func (handler *ReportSectionHandler) DeleteReportSection(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:DeleteReportSection get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid report section id"})
		return
	}
	err = handler.store.DeleteReportSectionById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "Report section not found"})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: DeleteReportSection: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error deleting report section: %v", err)})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
