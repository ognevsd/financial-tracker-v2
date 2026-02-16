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
	GetLayout(reportId string, companyId string) (models.Layout, error)
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

func (s *reportService) getSectionDetails(companyId string, reportId string, parentId string) (*models.LayoutSection, error) {
	layoutSection := &models.LayoutSection{}
	layoutFields := []models.LayoutField{}
	layoutSections := []models.LayoutSection{}

	sectionsFilter := store.ReportSectionFilter{
		ReportId: reportId,
		ParentId: &parentId,
	}
	fieldFilter := store.ReportFieldFilter{
		CompanyId: companyId,
		ReportId:  reportId,
		SectionId: &parentId,
	}
	fields, err := s.reportFieldStore.GetReportFields(&fieldFilter)
	if err != nil {
		return nil, err
	}
	for _, field := range fields {
		layoutFields = append(layoutFields, models.LayoutField{
			ID:         field.Id,
			Name:       field.OriginalName,
			OrderIndex: int64(field.OrderIndex),
		})
	}
	layoutSection.Fields = layoutFields

	sections, err := s.reportSectionStore.GetAllReportSections(sectionsFilter)
	if err != nil {
		return nil, err
	}

	for _, section := range sections {
		tmp, err := s.getSectionDetails(companyId, reportId, section.ID)
		if err != nil {
			return nil, err
		}
		layoutSections = append(layoutSections, models.LayoutSection{
			ID:         section.ID,
			Name:       section.Name,
			OrderIndex: int64(section.OrderIndex),
			Fields:     tmp.Fields,
			Sections:   tmp.Sections,
		})

	}
	// s.logger.Info("Sections", "parentId", parentId, "layoutSections", layoutSections)
	layoutSection.Sections = layoutSections

	// s.logger.Info("HERE", "layout section", layoutSection)
	return layoutSection, nil
}

func (s *reportService) GetLayout(reportId string, companyId string) (models.Layout, error) {
	layout := models.Layout{}

	sectionsFilter := store.ReportSectionFilter{
		ReportId: reportId,
		ParentId: utils.StringPtr(""),
	}

	sections, _ := s.reportSectionStore.GetAllReportSections(sectionsFilter)
	for _, section := range sections {
		sectionDetails, _ := s.getSectionDetails(companyId, reportId, section.ID)
		layout = append(layout, models.LayoutSection{
			ID:         section.ID,
			Name:       section.Name,
			OrderIndex: int64(section.OrderIndex),
			Sections:   sectionDetails.Sections,
			Fields:     sectionDetails.Fields,
		})
	}

	return layout, nil
}
