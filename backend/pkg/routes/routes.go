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

	r.Route("/api", func(r chi.Router) {

		r.Route("/report", func(r chi.Router) {
			r.Get("/", app.ReportHandler.GetAllReports)
			r.Post("/", app.ReportHandler.AddReprot)

			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", app.ReportHandler.GetReportById)
				r.Put("/", app.ReportHandler.UpdateReport)
				r.Delete("/", app.ReportHandler.DeleteReport)
			})

			r.Get("/layout", app.ReportHandler.GetLayout)
			r.Get("/details", app.ReportHandler.GetReportDetails)
		})

		r.Route("/report-section", func(r chi.Router) {
			r.Get("/", app.ReportSectionHandler.GetAllReportSections)
			r.Post("/", app.ReportSectionHandler.AddReportSection)

			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", app.ReportSectionHandler.GetReportSectionById)
				r.Put("/", app.ReportSectionHandler.UpdateReportSection)
				r.Delete("/", app.ReportSectionHandler.DeleteReportSection)
			})
		})

		r.Route("/report-field", func(r chi.Router) {
			r.Get("/", app.ReportFieldHandler.GetAllReportFields)
			r.Put("/", app.ReportFieldHandler.UpsertField)

			r.Post("/swap", app.ReportFieldHandler.SwapFields)

			r.Route("/{id}", func(r chi.Router) {
				r.Delete("/", app.ReportFieldHandler.DeleteField)
			})

			r.Route("/year", func(r chi.Router) {
				r.Get("/", app.ReportFieldHandler.GetYears)
				r.Put("/", app.ReportFieldHandler.UpsertYear)
			})
		})
	})

	r.Get("/api/taxonomy", app.TaxonomyHandler.GetAllTaxonomies)
	r.Get("/api/taxonomy/{id}", app.TaxonomyHandler.GetTaxonomyById)
	r.Put("/api/taxonomy/{id}", app.TaxonomyHandler.UpdateTaxonomy)
	r.Post("/api/taxonomy", app.TaxonomyHandler.AddTaxonomy)
	r.Delete("/api/taxonomy/{id}", app.TaxonomyHandler.DeleteTaxonomy)

	r.Post("/api/fieldValue", app.FieldValueHandler.AddFieldValue)

	r.Get("/api/asset", app.AssetHandler.GetAllAssets)
	r.Get("/api/asset/{id}", app.AssetHandler.GetAssetById)
	r.Post("/api/asset", app.AssetHandler.AddAsset)

	r.NotFound(app.ServeStaticFiles)

	return r
}
