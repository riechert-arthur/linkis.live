package handler

import (
	"context"
	"encoding/json"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/redis/go-redis/v9"
	"linkislive/internal/model"
	"linkislive/utils"
	"log"
	"net/http"
)

func AddURLMappingHandler(client *redis.Client, validate *validator.Validate) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req model.AddUrlRequest
		err := json.NewDecoder(r.Body).Decode(&req)

		if err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		if req.Short == "" || req.Long == "" {
			http.Error(w, "Missing short or long URL", http.StatusBadRequest)
			return
		}

		err = validate.Struct(req)
		if err != nil {
			log.Printf("validation failed: %+v\n", err)
			http.Error(w, "Invalid URL", http.StatusBadRequest)
			return
		} else if utils.IsPathTraversal(req.Long) {
			http.Error(w, "Path traversal is not allowed", http.StatusBadRequest)
			return
		} else if utils.IsSSRF(req.Long) {
			http.Error(w, "URL points to a disallowed internal IP", http.StatusBadRequest)
			return
		}

		existing, err := client.Exists(ctx, req.Short).Result()
		if err != nil {
			http.Error(w, "Redis error", http.StatusBadRequest)
			return
		} else if existing > 0 {
			http.Error(w, "Short URL already exists", http.StatusBadRequest)
			return
		}

		err = client.Set(ctx, req.Short, req.Long, 0).Err()
		if err != nil {
			http.Error(w, "An error occurred in the server", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "URL mapping created",
			"short":   req.Short,
			"long":    req.Long,
		})
	}
}

func GetURLMappingHandler(client *redis.Client, validate *validator.Validate) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()

		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		short := mux.Vars(r)["short"]

		existing, err := client.Exists(ctx, short).Result()
		if err != nil {
			log.Printf("Redis EXISTS error for short '%s': '%v'", short, err)
			http.Error(w, "Redis error", http.StatusInternalServerError)
			return
		} else if existing == 0 {
			http.Error(w, "Short url does not exist", http.StatusNotFound)
			return
		}

		val, err := client.Get(ctx, short).Result()
		if err != nil {
			log.Printf("Redis GET error for short '%s': '%v'", short, err)
			http.Error(w, "Redis error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Retrieved actual URL",
			"long":   val,
		})
	}
}
