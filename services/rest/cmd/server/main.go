package main

import (
	"linkislive/internal/handler"
	"linkislive/internal/redisdb"
	"log"
	"net/http"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
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

	cors := func (next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }
        next.ServeHTTP(w, r)
    })
	}

	r := mux.NewRouter()
	r.Use(cors)

	client := redisdb.NewClient()
	validate := validator.New(validator.WithRequiredStructEnabled())
	r.HandleFunc("/api/add_url_mapping", handler.AddURLMappingHandler(client, validate)).Methods("POST", "OPTIONS")
	r.HandleFunc("/{short}", handler.GetURLMappingHandler(client, validate)).Methods("GET", "OPTIONS")

	logged := handlers.LoggingHandler(f, r)

	log.Printf("Starting server on port %s (with CORS)...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, logged))
}
