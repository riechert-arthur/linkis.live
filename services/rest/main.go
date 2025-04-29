package main

import (
	"log"
	"net/http"
	"os"
)

func home(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello, World!"))
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s...\n", port)

	mux := http.NewServeMux()
	mux.HandleFunc("/", home)

	err := http.ListenAndServe(":" + port, mux)
	log.Fatal(err)	
}
