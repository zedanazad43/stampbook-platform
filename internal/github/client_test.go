package github_test

import (
	"context"
	"testing"
	"time"

	ghclient "github.com/zedanazad43/stp/internal/github"
	"github.com/zedanazad43/stp/lib/billing"
)

func TestClient_IngestUsage(t *testing.T) {
	tests := []struct {
		name      string
		event     billing.UsageEvent
		wantErr   bool
		wantCount int
	}{
		{
			name:      "valid event",
			event:     billing.UsageEvent{AccountID: "org1", SKU: "actions-minutes", Quantity: 100, RecordedAt: time.Now()},
			wantErr:   false,
			wantCount: 1,
		},
		{
			name:    "missing account ID",
			event:   billing.UsageEvent{SKU: "actions-minutes", Quantity: 10, RecordedAt: time.Now()},
			wantErr: true,
		},
		{
			name:    "missing SKU",
			event:   billing.UsageEvent{AccountID: "org1", Quantity: 10, RecordedAt: time.Now()},
			wantErr: true,
		},
		{
			name:    "negative quantity",
			event:   billing.UsageEvent{AccountID: "org1", SKU: "actions-minutes", Quantity: -1, RecordedAt: time.Now()},
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			recorder := &billing.InMemoryRecorder{}
			client := ghclient.NewClient("https://api.github.com", "token")
			err := client.IngestUsage(context.Background(), recorder, tc.event)
			if (err != nil) != tc.wantErr {
				t.Errorf("IngestUsage() error = %v, wantErr = %v", err, tc.wantErr)
			}
			if !tc.wantErr && len(recorder.Events) != tc.wantCount {
				t.Errorf("recorder.Events = %d, want %d", len(recorder.Events), tc.wantCount)
			}
		})
	}
}
