package app

import (
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/ognevsd/financial-tracker-v2/migrations"
	"github.com/ognevsd/financial-tracker-v2/pkg/api"
	"github.com/ognevsd/financial-tracker-v2/pkg/store"
)

const StaticFiles string = "../frontend/dist"

type Application struct {
	Logger               *log.Logger
	NewLogger            *slog.Logger
	TransactionHandler   *api.TransactionHandler
	CurrencyHandler      *api.CurrencyHandler
	OperationHandler     *api.OperationHandler
	AssetTypeHandler     *api.AssetTypeHandler
	ReportHandler        *api.ReportHandler
	ReportSectionHandler *api.ReportSectionHandler
	TaxonomyHandler      *api.TaxonomyHandler
	FieldValueHandler    *api.FieldValueHandler
	DB                   *sql.DB
}

func New() (*Application, error) {
	opts := &slog.HandlerOptions{
		AddSource: true,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey && len(groups) == 0 {
				t := a.Value.Time()
				a.Value = slog.TimeValue(t.Truncate(time.Second))
				return a
			}
			if a.Key == slog.SourceKey {
				src := a.Value.Any().(*slog.Source)

				file := filepath.Base(src.File)
				dir := filepath.Dir(src.File)
				pkg := filepath.Base(dir)

				src.File = pkg + ":" + file
				src.Function = ""
				return slog.Any(a.Key, src)
			}
			return a
		},
	}
	logger := log.New(os.Stdout, "", log.LstdFlags|log.Lshortfile)
	newLogger := slog.New(slog.NewJSONHandler(os.Stdout, opts))

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
	assetTypeStore := store.NewAssetTypeStore(sqliteDB)
	transactionStore := store.NewSqliteTransactionStore(sqliteDB)
	reportStore := store.NewSqliteReportStore(sqliteDB)
	reportSectionStore := store.NewSqliteReportSectionStore(sqliteDB)
	taxonomyStore := store.NewTaxonomyStore(sqliteDB)
	fieldValueStore := store.NewSqliteFieldValueStore(sqliteDB)

	// handlers will go here
	currencyHandler := api.NewCurrencyHandler(currencyStore, logger)
	operationHandler := api.NewOperationHandler(operationStore, logger)
	assetTypeHandler := api.NewAssetTypeHandler(assetTypeStore, logger)
	transactionHandler := api.NewTransactionHandler(transactionStore, logger, newLogger)
	reportHandler := api.NewReportHandler(reportStore, logger)
	reportSectionHandler := api.NewReportSectionHandler(reportSectionStore, logger)
	taxonomyHandler := api.NewTaxonomyHandler(taxonomyStore, logger)
	fieldValueHandler := api.NewFieldValueHandler(fieldValueStore, newLogger)

	app := &Application{
		Logger:               logger,
		NewLogger:            newLogger,
		TransactionHandler:   transactionHandler,
		CurrencyHandler:      currencyHandler,
		OperationHandler:     operationHandler,
		AssetTypeHandler:     assetTypeHandler,
		ReportHandler:        reportHandler,
		ReportSectionHandler: reportSectionHandler,
		TaxonomyHandler:      taxonomyHandler,
		FieldValueHandler:    fieldValueHandler,
		DB:                   sqliteDB,
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
