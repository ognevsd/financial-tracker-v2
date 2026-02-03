package services

import (
	"log/slog"

	"github.com/ognevsd/financial-tracker-v2/pkg/models"
	"github.com/ognevsd/financial-tracker-v2/pkg/store"
	"github.com/ognevsd/financial-tracker-v2/pkg/utils"
)

type reportService struct {
	logger                *slog.Logger
	reportStore           store.ReportStore
	reportSectionStore    store.ReportSectionStore
	reportFieldStore      store.ReportFieldStore
	reportFieldValueStore store.ReportFieldValueStore
}

type ReportService interface {
	GetLayout() (*models.Layout, error)
}

func NewReportService(
	logger *slog.Logger,
	reportStore store.ReportStore,
	reportSectionStore store.ReportSectionStore,
	reportFieldStore store.ReportFieldStore,
	reportFieldValueStore store.ReportFieldValueStore,
) *reportService {
	return &reportService{
		logger:                logger,
		reportStore:           reportStore,
		reportSectionStore:    reportSectionStore,
		reportFieldStore:      reportFieldStore,
		reportFieldValueStore: reportFieldValueStore,
	}
}

func (s *reportService) GetLayout() (*models.Layout, error) {
	layout := &models.Layout{}

	sectionsFilter := store.ReportSectionFilter{
		ReportId: "7842486a-1679-426f-b31e-d575a8aaed51",
		ParentId: utils.StringPtr(""),
	}

	sections, _ := s.reportSectionStore.GetAllReportSections(sectionsFilter)
	s.logger.Info("Sections", "sections", sections)

	return layout, nil
}
