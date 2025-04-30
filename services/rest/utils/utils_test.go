package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsPathTraversal(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{"no traversal", "https://example.com/path/to/resource", false},
		{"direct traversal", "https://example.com/../secret", true},
		{"encoded traversal", "https://example.com/%2e%2e/secret", true},
		{"double encoded traversal", "https://example.com/%252e%252e/secret", false}, // not decoded
		{"invalid url", "http://%zz", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsPathTraversal(tt.input))
		})
	}
}

func TestIsSSRF(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{"public url", "https://example.com", false},
		{"localhost", "http://localhost", true},
		{"loopback ip", "http://127.0.0.1", true},
		{"private ip", "http://192.168.0.1", true},
		{"invalid url", "http://%", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsSSRF(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
