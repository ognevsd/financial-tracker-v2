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
	AddYear(companyId string, reportId string, year int) error
	UpdateYear(companyId string, reportId string, year int, prevYear int) error
	GetYears(companyId string, reportId string) ([]int, error)
	DeleteYear(compnyId string, reportId string, year int) error
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

type fieldFetcher func(filter *store.ReportFieldFilter) ([]models.Field, error)

func (s *reportService) fieldFetcher(filter *store.ReportFieldFilter) ([]models.Field, error) {
	reportFields := []models.Field{}

	fields, err := s.reportFieldStore.GetReportFields(filter)
	if err != nil {
		return nil, err
	}

	for _, field := range fields {
		reportFields = append(reportFields, models.Field{
			ID:         field.Id,
			Name:       field.OriginalName,
			OrderIndex: field.OrderIndex,
		})
	}

	return reportFields, nil
}

func (s *reportService) layoutFieldFetcher(filter *store.ReportFieldFilter) ([]models.Field, error) {
	return s.fieldFetcher(filter)
}

func (s *reportService) reportFieldFetcher(filter *store.ReportFieldFilter) ([]models.Field, error) {
	reportFields, err := s.fieldFetcher(filter)
	if err != nil {
		return nil, err
	}

	for i := range reportFields {
		values, err := s.reportFieldValueStore.GetFieldValueByFieldId(reportFields[i].ID)
		if err != nil {
			return nil, err
		}
		fieldValues := map[int]*int{}
		for _, val := range values {
			fieldValues[val.Year] = val.Value
		}
		reportFields[i].Values = fieldValues
	}

	return reportFields, nil
}

func (s *reportService) getSectionDetails(companyId string, reportId string, parentId string, fetchFields fieldFetcher) (*models.Section, error) {
	layoutSection := &models.Section{}
	layoutSections := []models.Section{}

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

	fields, err := fetchFields(&fieldFilter)
	if err != nil {
		return nil, err
	}

	layoutSection.Fields = fields

	sections, err := s.reportSectionStore.GetAllReportSections(sectionsFilter)
	if err != nil {
		return nil, err
	}

	for _, section := range sections {
		tmp, err := s.getSectionDetails(companyId, reportId, section.ID, fetchFields)
		if err != nil {
			return nil, err
		}
		layoutSections = append(layoutSections, models.Section{
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
		sectionDetails, _ := s.getSectionDetails(companyId, reportId, section.ID, s.layoutFieldFetcher)
		layout = append(layout, models.Section{
			ID:         section.ID,
			Name:       section.Name,
			OrderIndex: int64(section.OrderIndex),
			Sections:   sectionDetails.Sections,
			Fields:     sectionDetails.Fields,
		})
	}

	return layout, nil
}

func (s *reportService) GetReport(reportId string, companyId string) (models.Report, error) {
	report := models.Report{}
	report.ID = reportId

	sectionsFilter := store.ReportSectionFilter{
		ReportId:         reportId,
		ParentId:         nil,
		FilterByParentId: true,
	}

	sections, err := s.reportSectionStore.GetAllReportSections(sectionsFilter)
	if err != nil {
		return models.Report{}, err
	}

	for _, section := range sections {
		sectionDetails, _ := s.getSectionDetails(companyId, reportId, section.ID, s.reportFieldFetcher)
		report.Sections = append(report.Sections, models.Section{
			ID:         section.ID,
			Name:       section.Name,
			OrderIndex: int64(section.OrderIndex),
			Sections:   sectionDetails.Sections,
			Fields:     sectionDetails.Fields,
		})
	}

	years, err := s.GetYears(companyId, reportId)
	if err != nil {
		return models.Report{}, err
	}
	report.Years = years

	return report, nil
}

func (s *reportService) AddYear(companyId string, reportId string, year int) error {
	reportFieldFilter := &store.ReportFieldFilter{
		ReportId:  reportId,
		CompanyId: companyId,
	}
	reportFields, err := s.reportFieldStore.GetReportFields(reportFieldFilter)
	if err != nil {
		return err
	}
	s.logger.Info("Report fields", "fields", reportFields)
	for _, field := range reportFields {
		_, err := s.reportFieldValueStore.AddFieldValue(&store.FieldValue{
			FieldId: field.Id,
			Year:    year,
		})

		if err != nil {
			return err
		}
	}

	return nil
}

func (s *reportService) UpdateYear(companyId string, reportId string, year int, prevYear int) error {
	return s.reportFieldValueStore.ChangeYear(companyId, reportId, year, prevYear)
}

func (s *reportService) DeleteYear(companyId string, reportId string, year int) error {
	return s.reportFieldValueStore.DeleteYear(companyId, reportId, year)
}

// GetYears collects all distinct years for a report fields and returns them as a list
func (s *reportService) GetYears(companyId string, reportId string) ([]int, error) {
	years := []int{}
	// 1. Get any report field
	reportField, err := s.reportFieldStore.GetReportFields(&store.ReportFieldFilter{
		CompanyId: companyId,
		ReportId:  reportId,
	})
	if err != nil {
		return nil, err
	}
	if len(reportField) == 0 {
		// return nil, errors.New("No fields found")
		return years, nil
	}

	// 2. Get all year values
	fieldValues, err := s.reportFieldValueStore.GetFieldValueByFieldId(reportField[0].Id)
	if err != nil {
		return nil, err
	}

	for _, value := range fieldValues {
		years = append(years, value.Year)
	}

	// 3. Create an array of years from any field
	return years, nil
}
