package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/ognevsd/financial-tracker-v2/pkg/app"
)

func SetUpRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/health", app.HealthCheck)

	r.Get("/api/transaction/{id}", app.TransactionHandler.HandleGetTransactionById)
	r.Post("/api/transaction", app.TransactionHandler.HandleAddTransaction)

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

	r.NotFound(app.ServeStaticFiles)

	return r
}
