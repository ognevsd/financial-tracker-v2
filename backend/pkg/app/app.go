package app

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/ognevsd/financial-tracker-v2/migrations"
	"github.com/ognevsd/financial-tracker-v2/pkg/api"
	"github.com/ognevsd/financial-tracker-v2/pkg/store"
)

const StaticFiles string = "../frontend/dist"

type Application struct {
	Logger             *log.Logger
	TransactionHandler *api.TransactionHandler
	CurrencyHandler    *api.CurrencyHandler
	OperationHandler   *api.OperationHandler
	DB                 *sql.DB
}

func New() (*Application, error) {
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)
	sqliteDB, err := store.Open()
	if err != nil {
		return nil, err
	}
	err = store.MigrateFS(sqliteDB, migrations.FS, ".")
	if err != nil {
		panic(err)
	}
	// stores will go here
	currencyStore := store.NewSqliteCurrencyStore(sqliteDB)
	operationStore := store.NewOperationStore(sqliteDB)

	// handlers will go here
	transactionHandler := api.NewTransactionHandler()
	currencyHandler := api.NewCurrencyHandler(currencyStore, logger)
	operationHandler := api.NewOperationHandler(operationStore, logger)

	app := &Application{
		Logger:             logger,
		TransactionHandler: transactionHandler,
		CurrencyHandler:    currencyHandler,
		OperationHandler:   operationHandler,
		DB:                 sqliteDB,
	}

	return app, nil
}

func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "OK\n")
}

func (a *Application) ServeStaticFiles(w http.ResponseWriter, r *http.Request) {
	fs := http.FileServer(http.Dir(StaticFiles))

	filePath := StaticFiles + r.URL.Path

	// File doesn't exist -> Client route (React Router handles it)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.ServeFile(w, r, StaticFiles)
		return
	}

	http.StripPrefix("/", fs).ServeHTTP(w, r)
}
