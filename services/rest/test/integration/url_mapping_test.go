package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"linkislive/internal/handler"
	"linkislive/internal/model"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
)

func setupRouter(client *redis.Client, validate *validator.Validate) *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/api/url", handler.AddURLMappingHandler(client, validate)).Methods("POST")
	r.HandleFunc("/{short}", handler.GetURLMappingHandler(client, validate)).Methods("GET")
	return r
}

func TestIntegration_AddAndGetURLMapping(t *testing.T) {
	ctx := context.Background()
	client := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
		DB:   1,
	})
	defer client.FlushDB(ctx)

	validate := validator.New()
	router := setupRouter(client, validate)

	t.Run("POST creates mapping", func(t *testing.T) {
		payload := model.AddUrlRequest{
			Short: "test-slug",
			Long:  "https://example.com",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/url", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
		assert.Contains(t, resp.Body.String(), "URL mapping created")
	})

	t.Run("GET retrieves mapping", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/test-slug", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
		assert.Contains(t, resp.Body.String(), "https://example.com")
	})

	t.Run("GET 404 on unknown slug", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/nonexistent", nil)
		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusNotFound, resp.Code)
	})
}
