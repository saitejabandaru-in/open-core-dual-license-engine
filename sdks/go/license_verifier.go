package main

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/pem"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

type CommercialLicensePayload struct {
	LicenseID     string `json:"licenseId"`
	CustomerName  string `json:"customerName"`
	CustomerEmail string `json:"customerEmail"`
	Tier          string `json:"tier"`
	MaxSeats      int    `json:"maxSeats"`
	MaxNodes      int    `json:"maxNodes"`
	IssuedAt      string `json:"issuedAt"`
	ExpiresAt     string `json:"expiresAt"`
}

type LicenseVerificationResult struct {
	Valid   bool                      `json:"valid"`
	Active  bool                      `json:"active"`
	Reason  string                    `json:"reason,omitempty"`
	Payload *CommercialLicensePayload `json:"payload,omitempty"`
}

func VerifyLicenseKey(licenseKey string, publicKeyPEM string) LicenseVerificationResult {
	block, _ := pem.Decode([]byte(publicKeyPEM))
	if block == nil {
		return LicenseVerificationResult{Valid: false, Reason: "Failed to decode PEM public key"}
	}

	pubKey := ed25519.PublicKey(block.Bytes)

	parts := strings.Split(strings.TrimSpace(licenseKey), ".")
	if len(parts) != 2 {
		return LicenseVerificationResult{Valid: false, Reason: "Invalid key format"}
	}

	payloadB64, sigB64 := parts[0], parts[1]

	sigBytes, err := base64.RawURLEncoding.DecodeString(sigB64)
	if err != nil {
		return LicenseVerificationResult{Valid: false, Reason: "Invalid signature encoding"}
	}

	isValid := ed25519.Verify(pubKey, []byte(payloadB64), sigBytes)
	if !isValid {
		return LicenseVerificationResult{Valid: false, Reason: "Signature verification failed"}
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return LicenseVerificationResult{Valid: false, Reason: "Invalid payload encoding"}
	}

	var payload CommercialLicensePayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return LicenseVerificationResult{Valid: false, Reason: "Failed to parse JSON payload"}
	}

	expirationDate, err := time.Parse("2006-01-02", payload.ExpiresAt)
	if err == nil && time.Now().After(expirationDate) {
		return LicenseVerificationResult{Valid: true, Active: false, Reason: "License expired", Payload: &payload}
	}

	return LicenseVerificationResult{Valid: true, Active: true, Payload: &payload}
}

func main() {
	fmt.Println("Go Ed25519 License Verifier SDK Module Loaded Successfully.")
}
