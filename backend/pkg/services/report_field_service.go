package services

import (
	"errors"
	"fmt"
	"log/slog"

	"github.com/ognevsd/financial-tracker-v2/pkg/store"
)

type reportFieldService struct {
	logger          *slog.Logger
	store           store.ReportFieldStore
	fieldValueStore store.ReportFieldValueStore
}

func NewReportFieldService(
	logger *slog.Logger,
	store store.ReportFieldStore,
	fieldValueStore store.ReportFieldValueStore,
) *reportFieldService {
	return &reportFieldService{logger: logger, store: store, fieldValueStore: fieldValueStore}
}

type ReportFieldService interface {
	UpsertField(input *UpsertFieldInput) error
	DeleteField(id string) error
	SwapFields(fieldIdOne string, orderIndexOne int, fieldIdTwo string, orderIndexTwo int) error
	AddYear(companyId string, reportId string, year int) error
	UpdateYear(companyId string, reportId string, year int, prevYear int) error
	GetYears(companyId string, reportId string) ([]int, error)
}

type UpsertFieldInput struct {
	CompanyId  string  `json:"companyId"`
	ReportId   string  `json:"reportId"`
	SectionId  string  `json:"sectionId"`
	FieldId    string  `json:"fieldId"`
	OrderIndex int     `json:"orderIndex"`
	Name       string  `json:"name"`
	TaxonomyId *string `json:"taxonomyId"`
}

func (s *reportFieldService) UpsertField(input *UpsertFieldInput) error {
	s.logger.Info("Upserting field", "field", input)

	exists, err := s.store.FieldExists(input.FieldId)
	if err != nil {
		return fmt.Errorf("Failed to check for field existance: %w", err)
	}
	if exists {
		err = s.store.UpdateReportField(&store.ReportField{
			Id:           input.FieldId,
			OriginalName: input.Name,
			OrderIndex:   input.OrderIndex,
			ReportId:     input.ReportId,
			SectionId:    input.SectionId,
			AssetId:      input.CompanyId,
			TaxonomyId:   input.TaxonomyId,
		})
		return err
	}
	_, err = s.store.AddReportField(&store.ReportField{
		Id:           input.FieldId,
		OriginalName: input.Name,
		OrderIndex:   input.OrderIndex,
		ReportId:     input.ReportId,
		SectionId:    input.SectionId,
		AssetId:      input.CompanyId,
		TaxonomyId:   input.TaxonomyId,
	})
	return err
}

func (s *reportFieldService) SwapFields(fieldIdOne string, orderIndexOne int, fieldIdTwo string, orderIndexTwo int) error {
	return s.store.SwapFields(fieldIdOne, orderIndexOne, fieldIdTwo, orderIndexTwo)

}

func (s *reportFieldService) DeleteField(id string) error {
	reportField, err := s.store.GetReportFieldById(id)
	if err != nil {
		return err
	}

	err = s.store.DeleteReportField(id)
	if err != nil {
		return err
	}

	fieldFilter := &store.ReportFieldFilter{
		SectionId: &reportField.SectionId,
	}
	reportFields, err := s.store.GetReportFields(fieldFilter)
	if err != nil {
		return err
	}

	for i, field := range reportFields {
		s.store.UpdateReportField(&store.ReportField{
			Id:           field.Id,
			OriginalName: field.OriginalName,
			OrderIndex:   i + 1,
			ReportId:     field.ReportId,
			SectionId:    field.SectionId,
			AssetId:      field.AssetId,
			TaxonomyId:   field.TaxonomyId,
		})
	}
	// s.logger.Info("Report Fields", "fields", reportFields)

	return nil
}

func (s *reportFieldService) AddYear(companyId string, reportId string, year int) error {
	reportFieldFilter := &store.ReportFieldFilter{
		ReportId:  reportId,
		CompanyId: companyId,
	}
	reportFields, err := s.store.GetReportFields(reportFieldFilter)
	if err != nil {
		return err
	}
	s.logger.Info("Report fields", "fields", reportFields)
	for _, field := range reportFields {
		_, err := s.fieldValueStore.AddFieldValue(&store.FieldValue{
			FieldId: field.Id,
			Year:    year,
		})

		if err != nil {
			return err
		}
	}

	return nil
}

func (s *reportFieldService) UpdateYear(companyId string, reportId string, year int, prevYear int) error {
	return s.fieldValueStore.ChangeYear(companyId, reportId, year, prevYear)
}

func (s *reportFieldService) DeleteYear(companyId string, reportId string, year int) error {
	return nil
}

func (s *reportFieldService) GetYears(companyId string, reportId string) ([]int, error) {
	years := []int{}
	// 1. Get any report field
	reportField, err := s.store.GetReportFields(&store.ReportFieldFilter{
		CompanyId: companyId,
		ReportId:  reportId,
	})
	if err != nil {
		return nil, err
	}
	if len(reportField) == 0 {
		return nil, errors.New("No fields found")
	}

	// 2. Get all year values
	fieldValues, err := s.fieldValueStore.GetFieldValueByFieldId(reportField[0].Id)
	if err != nil {
		return nil, err
	}

	for _, value := range fieldValues {
		years = append(years, value.Year)
	}

	// 3. Create an array of years from any field
	return years, nil
}
