// Package github provides a client for interacting with GitHub services
// related to metered usage ingestion.
package github

import (
	"context"
	"fmt"

	"github.com/zedanazad43/stp/lib/billing"
)

// Client interacts with GitHub APIs for usage ingestion.
type Client struct {
	baseURL string
	token   string
}

// NewClient returns a new Client configured with the given base URL and auth token.
func NewClient(baseURL, token string) *Client {
	return &Client{baseURL: baseURL, token: token}
}

// IngestUsage sends a usage event to the GitHub billing ingestion endpoint.
// This is a stub that validates the event and records it locally.
func (c *Client) IngestUsage(_ context.Context, recorder billing.Recorder, event billing.UsageEvent) error {
	if event.AccountID == "" {
		return fmt.Errorf("usage event must have a non-empty AccountID")
	}
	if event.SKU == "" {
		return fmt.Errorf("usage event must have a non-empty SKU")
	}
	if event.Quantity < 0 {
		return fmt.Errorf("usage event quantity must be non-negative, got %d", event.Quantity)
	}
	return recorder.Record(event)
}
