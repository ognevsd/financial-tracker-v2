package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type ReportHandler struct {
	logger *log.Logger
	store  store.ReportStore
}

func NewReportHandler(store store.ReportStore, logger *log.Logger) *ReportHandler {
	return &ReportHandler{store: store, logger: logger}
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
