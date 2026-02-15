package api

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type ReportFieldHandler struct {
	logger *slog.Logger
	store  store.ReportFieldStore
}

func NewReportFieldHandler(store store.ReportFieldStore, logger *slog.Logger) *ReportFieldHandler {
	return &ReportFieldHandler{store: store, logger: logger}
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
		SectionId  *string `json:"sectionId"`
		FieldId    *string `json:"fieldId"`
		OrderIndex *int    `json:"orderIndex"`
		Name       *string `json:"name"`
		TaxonomyId *string `json:"taxonomyId"`
	}
	json.NewDecoder(r.Body).Decode(&fieldDetails)
	handler.logger.Info("Field details", "details", fieldDetails)

	exists, err := handler.store.FieldExists(*fieldDetails.FieldId)
	if err != nil {
		handler.logger.Error("Error checking if field exists", "error", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrorPayload(fmt.Sprintf("Error checking if field exists", err)))
		return
	}

	if exists {
		// TODO: Update field
	} else {
		handler.store.AddReportField(&store.ReportField{
			Id:           *fieldDetails.FieldId,
			OriginalName: *fieldDetails.Name,
			OrderIndex:   *fieldDetails.OrderIndex,
			SectionId:    *fieldDetails.SectionId,
			AssetId:      *fieldDetails.CompanyId,
			TaxonomyId:   fieldDetails.TaxonomyId,
		})
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{})
}
