package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/ognevsd/financial-tracker-v2/pkg/app"
)

func SetUpRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/health", app.HealthCheck)

	r.Get("/api/transaction", app.TransactionHandler.GetAllTransactions)
	r.Get("/api/transaction/{id}", app.TransactionHandler.GetTransactionById)
	r.Put("/api/transaction/{id}", app.TransactionHandler.UpdateTransaction)
	r.Post("/api/transaction", app.TransactionHandler.AddTransaction)
	r.Delete("/api/transaction/{id}", app.TransactionHandler.DeleteTransactionById)

	r.Get("/api/currency", app.CurrencyHandler.GetAllCurrencies)
	r.Get("/api/currency/{id}", app.CurrencyHandler.GetCurrencyById)
	r.Put("/api/currency/{id}", app.CurrencyHandler.UpdateCurrency)
	r.Post("/api/currency", app.CurrencyHandler.HandleAddCurrency)
	r.Delete("/api/currency/{id}", app.CurrencyHandler.DeleteCurrencyById)

	r.Get("/api/operation", app.OperationHandler.GetAllOperations)
	r.Get("/api/operation/{id}", app.OperationHandler.GetOperationById)
	r.Put("/api/operation/{id}", app.OperationHandler.UpdateOperation)
	r.Post("/api/operation", app.OperationHandler.AddOperation)
	r.Delete("/api/operation/{id}", app.OperationHandler.DeleteOperation)

	r.Get("/api/assettype", app.AssetTypeHandler.GetAllAssetTypes)
	r.Get("/api/assettype/{id}", app.AssetTypeHandler.GetAssetTypeById)
	r.Put("/api/assettype/{id}", app.AssetTypeHandler.UpdateAssetType)
	r.Post("/api/assettype", app.AssetTypeHandler.AddAssetType)
	r.Delete("/api/assettype/{id}", app.AssetTypeHandler.DeleteAssetType)

	r.Get("/api/report", app.ReportHandler.GetAllReports)
	r.Get("/api/report/{id}", app.ReportHandler.GetReportById)
	r.Put("/api/report/{id}", app.ReportHandler.UpdateReport)
	r.Post("/api/report", app.ReportHandler.AddReprot)
	r.Delete("/api/report/{id}", app.ReportHandler.DeleteReport)

	r.Get("/api/report-section", app.ReportSectionHandler.GetAllReportSections)
	r.Get("/api/report-section/{id}", app.ReportSectionHandler.GetReportSectionById)
	r.Put("/api/report-section/{id}", app.ReportSectionHandler.UpdateReportSection)
	r.Post("/api/report-section", app.ReportSectionHandler.AddReportSection)
	r.Delete("/api/report-section/{id}", app.ReportSectionHandler.DeleteReportSection)

	r.Get("/api/taxonomy", app.TaxonomyHandler.GetAllTaxonomies)
	r.Get("/api/taxonomy/{id}", app.TaxonomyHandler.GetTaxonomyById)
	r.Put("/api/taxonomy/{id}", app.TaxonomyHandler.UpdateTaxonomy)
	r.Post("/api/taxonomy", app.TaxonomyHandler.AddTaxonomy)
	r.Delete("/api/taxonomy/{id}", app.TaxonomyHandler.DeleteTaxonomy)

	r.Post("/api/fieldValue", app.FieldValueHandler.AddFieldValue)

	r.NotFound(app.ServeStaticFiles)

	return r
}
