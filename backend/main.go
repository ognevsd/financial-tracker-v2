package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/ognevsd/financial-tracker-v2/pkg/app"
)

const StaticFiles string = "../frontend/dist"

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "OK\n")
}

func ServeStaticFiles(w http.ResponseWriter, r *http.Request) {
	fs := http.FileServer(http.Dir(StaticFiles))

	filePath := StaticFiles + r.URL.Path

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.ServeFile(w, r, StaticFiles)
		return
	}

	http.StripPrefix("/", fs).ServeHTTP(w, r)

}

func main() {
	var port int
	flag.IntVar(&port, "port", 8080, "Go backend server port")
	flag.Parse()

	app, err := app.New()
	if err != nil {
		panic(err)
	}

	http.HandleFunc("/health", HealthCheck)

	// Catch-all path should be last, for details check Go's ServeMux
	http.HandleFunc("/", ServeStaticFiles)

	server := &http.Server{
		Addr:           fmt.Sprintf(":%d", port),
		IdleTimeout:    time.Minute,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	app.Logger.Printf("App is running on port :%d", port)
	err = server.ListenAndServe()
	if err != nil {
		app.Logger.Fatal(err)
	}

}
