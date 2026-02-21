package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/services"
	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type ReportFieldHandler struct {
	logger             *slog.Logger
	store              store.ReportFieldStore
	reportFieldService services.ReportFieldService
}

func NewReportFieldHandler(
	store store.ReportFieldStore,
	reportFieldService services.ReportFieldService,
	logger *slog.Logger,
) *ReportFieldHandler {
	return &ReportFieldHandler{
		store:              store,
		reportFieldService: reportFieldService,
		logger:             logger,
	}
}

func (handler *ReportFieldHandler) GetAllReportFields(w http.ResponseWriter, r *http.Request) {
	filter := &store.ReportFieldFilter{
		CompanyId: r.URL.Query().Get("companyId"),
		ReportId:  r.URL.Query().Get("reportId"),
	}

	reportFields, err := handler.store.GetReportFields(filter)
	if err != nil {
		handler.logger.Error("Get all report fields", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error getting all report fields: %v", err)))
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"reportField": reportFields})
}

func (handler *ReportFieldHandler) UpsertField(w http.ResponseWriter, r *http.Request) {
	var fieldDetails struct {
		CompanyId  *string `json:"companyId"`
		ReportId   *string `json:"reportId"`
		SectionId  *string `json:"sectionId"`
		FieldId    *string `json:"fieldId"`
		OrderIndex *int    `json:"orderIndex"`
		Name       *string `json:"name"`
		TaxonomyId *string `json:"taxonomyId"`
	}
	err := json.NewDecoder(r.Body).Decode(&fieldDetails)
	if err != nil {
		handler.logger.Error("Failed to parse request payload", "error", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload(fmt.Sprintf("Failed to parse request payload: %v", err)))
	}
	handler.logger.Info("Upserting field", "details", fieldDetails)

	if fieldDetails.CompanyId == nil || fieldDetails.ReportId == nil || fieldDetails.SectionId == nil ||
		fieldDetails.OrderIndex == nil || fieldDetails.Name == nil {
		handler.logger.Error("Requred input is missing")
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("Required input is missing"))
		return
	}

	err = handler.reportFieldService.UpsertField(&services.UpsertFieldInput{
		FieldId:    *fieldDetails.FieldId,
		Name:       *fieldDetails.Name,
		OrderIndex: *fieldDetails.OrderIndex,
		CompanyId:  *fieldDetails.CompanyId,
		ReportId:   *fieldDetails.ReportId,
		SectionId:  *fieldDetails.SectionId,
		TaxonomyId: fieldDetails.TaxonomyId,
	})
	if err != nil {
		handler.logger.Error("Error upserting field", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error upserting field: %v", err)))
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{})
}

func (h *ReportFieldHandler) DeleteField(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		h.logger.Error("Cannot read id from the url", "error", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload(fmt.Sprintf("Cannot read id from the url: %v", err)))
		return
	}
	err = h.reportFieldService.DeleteField(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.ErrorPayload(fmt.Sprintf("Field with id %s not found", id)))
		return
	}
	if err != nil {
		h.logger.Error("Error when deleting field", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error when deleting field: %v", err)))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ReportFieldHandler) SwapFields(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		FieldIdOne    *string `json:"fieldIdOne"`
		FieldIdTwo    *string `json:"fieldIdTwo"`
		OrderIndexOne *int    `json:"orderIndexOne"`
		OrderIndexTwo *int    `json:"orderIndexTwo"`
	}

	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		h.logger.Error("Error parsing json body", "error", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload(fmt.Sprintf("Error parsing json body: %v", err)))
		return
	}

	if requestBody.FieldIdOne == nil || requestBody.FieldIdTwo == nil ||
		requestBody.OrderIndexOne == nil || requestBody.OrderIndexTwo == nil {
		h.logger.Error("Missing data")
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("Missing data for swapping fields"))
		return
	}

	err = h.reportFieldService.SwapFields(*requestBody.FieldIdOne, *requestBody.OrderIndexOne, *requestBody.FieldIdTwo, *requestBody.OrderIndexTwo)
	if err != nil {
		h.logger.Error("Error swapping fields", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error swapping fields: %v", err)))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ReportFieldHandler) UpsertYear(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		CompanyId *string `json:"companyId"`
		ReportId  *string `json:"reportId"`
		Year      *int    `json:"year"`
		PrevYear  *int    `json:"prevYear"`
	}
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		h.logger.Error("Error parsing json body", "error", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload(fmt.Sprintf("Error parsing json body: %v", err)))
		return
	}

	if requestBody.ReportId == nil || requestBody.Year == nil || requestBody.CompanyId == nil {
		h.logger.Error("Missing data")
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("Missing data"))
		return
	}
	h.logger.Info("year", "year", requestBody)

	if requestBody.PrevYear == nil {
		err = h.reportFieldService.AddYear(*requestBody.CompanyId, *requestBody.ReportId, *requestBody.Year)
		if err != nil {
			h.logger.Error("Error adding year", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error adding year: %v", err)))
			return
		}
	} else {
		err = h.reportFieldService.UpdateYear(*requestBody.CompanyId, *requestBody.ReportId, *requestBody.Year, *requestBody.PrevYear)
		if err != nil {
			h.logger.Error("Error changing year", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error adding year: %v", err)))
			return
		}
	}
}

func (h *ReportFieldHandler) GetYears(w http.ResponseWriter, r *http.Request) {
	companyId := r.URL.Query().Get("companyId")
	if companyId == "" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("companyId is missing"))
		return
	}
	reportId := r.URL.Query().Get("reportId")
	if reportId == "" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("reportId is missing"))
		return
	}

	years, err := h.reportFieldService.GetYears(companyId, reportId)
	if err != nil {
		h.logger.Error("Error getting years", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error geting years: %v", err)))
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"years": years})
}
