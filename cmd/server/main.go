// Command server is the main entry point for the metered usage ingestion service.
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	ghclient "github.com/zedanazad43/stp/internal/github"
	"github.com/zedanazad43/stp/lib/billing"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	recorder := &billing.InMemoryRecorder{}
	client := ghclient.NewClient(
		getEnv("GITHUB_API_URL", "https://api.github.com"),
		os.Getenv("GITHUB_TOKEN"),
	)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "ok")
	})
	mux.HandleFunc("/ingest", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		quantity, err := strconv.ParseInt(r.FormValue("quantity"), 10, 64)
		if err != nil {
			http.Error(w, "quantity must be a valid integer", http.StatusBadRequest)
			return
		}
		event := billing.UsageEvent{
			AccountID:  r.FormValue("account_id"),
			SKU:        r.FormValue("sku"),
			Quantity:   quantity,
			RecordedAt: time.Now(),
		}
		if err := client.IngestUsage(context.Background(), recorder, event); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusAccepted)
		fmt.Fprintln(w, "accepted")
	})

	log.Printf("starting usage ingestion server on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
