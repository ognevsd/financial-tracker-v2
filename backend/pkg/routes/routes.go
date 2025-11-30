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

	r.NotFound(app.ServeStaticFiles)

	return r
}
