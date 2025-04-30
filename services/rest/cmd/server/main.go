package main

import (
	"linkislive/internal/handler"
	"linkislive/internal/redisdb"
	"log"
	"net/http"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
)

func main() {
	f, err := os.OpenFile("server.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("failed to open log file: %v", err)
	}

	log.SetOutput(f)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	client := redisdb.NewClient()
	r := mux.NewRouter()
	validate := validator.New(validator.WithRequiredStructEnabled())
	r.HandleFunc("/api/add_url_mapping", handler.AddURLMappingHandler(client, validate)).Methods("POST")
	r.HandleFunc("/{short}", handler.GetURLMappingHandler(client, validate)).Methods("GET")

	log.Printf("Starting server on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
