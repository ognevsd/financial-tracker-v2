package app

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

const StaticFiles string = "../frontend/dist"

type Application struct {
	Logger *log.Logger
}

func New() (*Application, error) {
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)
	app := &Application{Logger: logger}

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
