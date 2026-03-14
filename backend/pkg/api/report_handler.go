package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/ognevsd/financial-tracker-v2/pkg/services"
	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type ReportHandler struct {
	logger        *log.Logger
	newLogger     *slog.Logger
	store         store.ReportStore
	reportService services.ReportService
}

func NewReportHandler(
	store store.ReportStore,
	reportService services.ReportService,
	logger *log.Logger,
	newLogger *slog.Logger,
) *ReportHandler {
	return &ReportHandler{store: store, reportService: reportService, logger: logger, newLogger: newLogger}
}

func (handler *ReportHandler) AddReprot(w http.ResponseWriter, r *http.Request) {
	var report store.Report
	err := json.NewDecoder(r.Body).Decode(&report)
	if err != nil {
		handler.logger.Printf("ERROR api:AddReport decode request body: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error parsing request body: %v", err)})
		return
	}

	createdReport, err := handler.store.AddReport(&report)
	if err != nil {
		handler.logger.Printf("ERROR api:AddReport create report in db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error adding report to DB: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"report": createdReport})
}

func (handler *ReportHandler) GetAllReports(w http.ResponseWriter, r *http.Request) {
	reports, err := handler.store.GetAllReports()
	if err != nil {
		handler.logger.Printf("ERROR api:GetAllReports get reports from DB: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error getting reports from DB: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"report": reports})
}

func (handler *ReportHandler) GetReportById(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR api:GetReportById get id param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Error parsing id from url: %v", err)})
		return
	}
	report, err := handler.store.GetReportById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find report with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR api:GetReportById get report from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Internal error: %v", err)})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"report": report})
}

func (handler *ReportHandler) UpdateReport(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR api:GetReportById get id param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Error parsing id from url: %v", err)})
		return
	}
	report, err := handler.store.GetReportById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": fmt.Sprintf("Cannot find report with id: %s", id)})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR api:GetReportById get report from db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Internal error: %v", err)})
		return
	}

	var updatedReport struct {
		ID   *string `json:"id"`
		Name *string `json:"name"`
	}
	err = json.NewDecoder(r.Body).Decode(&updatedReport)
	if err != nil {
		handler.logger.Printf("ERROR api:UpdateReport parse request body: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": fmt.Sprintf("Error parsing request body: %v", err)})
		return
	}

	if updatedReport.Name != nil {
		report.Name = *updatedReport.Name
	}

	err = handler.store.UpdateReport(report)

	if err != nil {
		handler.logger.Printf("ERROR: api:UpdateReport update operation: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"report": report})
}

func (handler *ReportHandler) DeleteReport(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIdParam(r)
	if err != nil {
		handler.logger.Printf("ERROR: api:DeleteReport get id from slug: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid report id"})
		return
	}
	err = handler.store.DeleteReportById(id)
	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "Report not found"})
		return
	}
	if err != nil {
		handler.logger.Printf("ERROR: DeleteCurrency: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": fmt.Sprintf("Error deleting asset type: %v", err)})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (handler *ReportHandler) GetLayout(w http.ResponseWriter, r *http.Request) {
	reportId := r.URL.Query().Get("reportId")
	if reportId == "" {
		handler.newLogger.Error("Missing report id param")
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("Missing reportId param"))
		return
	}
	companyId := r.URL.Query().Get("companyId")
	if companyId == "" {
		handler.newLogger.Error("Missing companyId param")
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("Missing companyId param"))
		return
	}
	layout, err := handler.reportService.GetLayout(reportId, companyId)
	if err != nil {
		handler.newLogger.Error("Error occured while building layout", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error occured while building layout: %v", err)))
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"layout": layout})
}

func (h *ReportHandler) GetReportDetails(w http.ResponseWriter, r *http.Request) {
	reportId := r.URL.Query().Get("reportId")
	if reportId == "" {
		h.newLogger.Error("Missing report id param")
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("Missing reportId param"))
		return
	}
	companyId := r.URL.Query().Get("companyId")
	if companyId == "" {
		h.newLogger.Error("Missing companyId param")
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("Missing companyId param"))
		return
	}
	report, err := h.reportService.GetReport(reportId, companyId)
	if err != nil {
		h.newLogger.Error("Error occured while building layout", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error occured while building layout: %v", err)))
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"report": report})
}

func (h *ReportHandler) UpsertYear(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		CompanyId *string `json:"companyId"`
		ReportId  *string `json:"reportId"`
		Year      *int    `json:"year"`
		PrevYear  *int    `json:"prevYear"`
	}
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		h.newLogger.Error("Error parsing json body", "error", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload(fmt.Sprintf("Error parsing json body: %v", err)))
		return
	}

	if requestBody.ReportId == nil || requestBody.Year == nil || requestBody.CompanyId == nil {
		h.newLogger.Error("Missing data")
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("Missing data"))
		return
	}
	h.newLogger.Info("year", "year", requestBody)

	if requestBody.PrevYear == nil {
		err = h.reportService.AddYear(*requestBody.CompanyId, *requestBody.ReportId, *requestBody.Year)
		if err != nil {
			h.newLogger.Error("Error adding year", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error adding year: %v", err)))
			return
		}
	} else {
		err = h.reportService.UpdateYear(*requestBody.CompanyId, *requestBody.ReportId, *requestBody.Year, *requestBody.PrevYear)
		if err != nil {
			h.newLogger.Error("Error changing year", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error adding year: %v", err)))
			return
		}
	}
}

func (h *ReportHandler) GetYears(w http.ResponseWriter, r *http.Request) {
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

	years, err := h.reportService.GetYears(companyId, reportId)
	if err != nil {
		h.newLogger.Error("Error getting years", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error geting years: %v", err)))
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"years": years})
}

func (h *ReportHandler) DeleteYear(w http.ResponseWriter, r *http.Request) {
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
	yearStr := r.URL.Query().Get("year")
	if yearStr == "" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload("year is missing"))
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.ErrorPayload(fmt.Sprintf("cannot parse to int year: %s", yearStr)))
		return
	}

	err = h.reportService.DeleteYear(companyId, reportId, year)
	if err != nil {
		h.newLogger.Error("Error when deleting year", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error when deleting year: %v", err)))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
