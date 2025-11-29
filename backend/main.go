package main

import (
	"flag"

	"github.com/ognevsd/financial-tracker-v2/pkg/app"
)

func main() {
	var port int
	flag.IntVar(&port, "port", 8080, "Go backend server port")
	flag.Parse()

	app, err := app.New()
	if err != nil {
		panic(err)
	}
}
