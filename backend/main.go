package main

import (
	"flag"
	"fmt"
	"net/http"
	"time"

	"github.com/ognevsd/financial-tracker-v2/pkg/app"
	"github.com/ognevsd/financial-tracker-v2/pkg/routes"
)

func main() {
	var port int
	flag.IntVar(&port, "port", 8080, "Go backend server port")
	flag.Parse()

	app, err := app.New()
	if err != nil {
		panic(err)
	}
	app.DB.Close()

	router := routes.SetUpRoutes(app)

	// Catch-all path should be last, for details check Go's ServeMux
	// http.HandleFunc("/", ServeStaticFiles)

	server := &http.Server{
		Addr:           fmt.Sprintf(":%d", port),
		Handler:        router,
		IdleTimeout:    time.Minute,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	app.Logger.Printf("App is running on port :%d\n", port)
	err = server.ListenAndServe()
	if err != nil {
		app.Logger.Fatal(err)
	}

}
