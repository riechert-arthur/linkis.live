package redisdb

import (
	"github.com/redis/go-redis/v9"
	"os"
)

func NewClient() *redis.Client {
	addr := os.Getenv("REDDIS_ADDR")
	if addr == "" {
		addr = "redis:6379"
	}

	return redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "",
		DB:       0,
		Protocol: 2,
	})
}
