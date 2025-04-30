package utils

import (
	"net"
	"net/url"
	"strings"
)

func IsPathTraversal(u string) bool {
	parsed, err := url.Parse(u)
	if err != nil {
		return false
	}

	decodedPath, err := url.PathUnescape(parsed.EscapedPath())
	if err != nil {
		return false
	}

	cleaned := strings.ToLower(decodedPath)
	return strings.Contains(cleaned, "..")
}

func IsSSRF(u string) bool {
	parsed, err := url.Parse(u)
	if err != nil {
		return false
	}

	host := parsed.Hostname()

	ips, err := net.LookupIP(host)
	if err != nil {
		return true
	}

	for _, ip := range ips {
		if ip.IsLoopback() || ip.IsPrivate() {
			return true
		}
	}
	return false
}
