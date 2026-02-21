package services

import (
	"log/slog"

	"github.com/ognevsd/financial-tracker-v2/pkg/models"
	"github.com/ognevsd/financial-tracker-v2/pkg/store"
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
	GetReport(reportId string, companyId string) (models.Report, error)
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
		ReportId:         reportId,
		ParentId:         &parentId,
		FilterByParentId: true,
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
	layoutSection.Sections = layoutSections

	return layoutSection, nil
}

func (s *reportService) GetLayout(reportId string, companyId string) (models.Layout, error) {
	layout := models.Layout{}

	sectionsFilter := store.ReportSectionFilter{
		ReportId:         reportId,
		ParentId:         nil,
		FilterByParentId: true,
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

func (s *reportService) getReportSectionDetails(companyId string, reportId string, parentId string) (*models.Section, error) {
	reportSection := &models.Section{}
	reportFields := []models.Field{}
	reportSections := []models.Section{}

	sectionsFilter := store.ReportSectionFilter{
		ReportId:         reportId,
		ParentId:         &parentId,
		FilterByParentId: true,
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
		values, err := s.reportFieldValueStore.GetFieldValueByFieldId(field.Id)
		if err != nil {
			return nil, err
		}
		fieldValues := map[int]*int{}
		for _, val := range values {
			fieldValues[val.Year] = val.Value
		}
		s.logger.Info("Field values", "values", fieldValues)

		reportFields = append(reportFields, models.Field{
			ID:         field.Id,
			Name:       field.OriginalName,
			OrderIndex: int64(field.OrderIndex),
			Values:     fieldValues,
		})
	}
	reportSection.Fields = reportFields

	sections, err := s.reportSectionStore.GetAllReportSections(sectionsFilter)
	if err != nil {
		return nil, err
	}

	for _, section := range sections {
		tmp, err := s.getReportSectionDetails(companyId, reportId, section.ID)
		if err != nil {
			return nil, err
		}
		reportSections = append(reportSections, models.Section{
			ID:         section.ID,
			Name:       section.Name,
			OrderIndex: int64(section.OrderIndex),
			Fields:     tmp.Fields,
			Sections:   tmp.Sections,
		})

	}
	reportSection.Sections = reportSections

	return reportSection, nil
}

func (s *reportService) GetReport(reportId string, companyId string) (models.Report, error) {
	report := models.Report{}
	report.ID = reportId

	sectionsFilter := store.ReportSectionFilter{
		ReportId:         reportId,
		ParentId:         nil,
		FilterByParentId: true,
	}

	sections, _ := s.reportSectionStore.GetAllReportSections(sectionsFilter)
	for _, section := range sections {
		sectionDetails, _ := s.getReportSectionDetails(companyId, reportId, section.ID)
		report.Sections = append(report.Sections, models.Section{
			ID:         section.ID,
			Name:       section.Name,
			OrderIndex: int64(section.OrderIndex),
			Sections:   sectionDetails.Sections,
			Fields:     sectionDetails.Fields,
		})
	}

	return report, nil
}
