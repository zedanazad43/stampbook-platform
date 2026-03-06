package billing_test

import (
	"testing"
	"time"

	"github.com/zedanazad43/stp/lib/billing"
)

func TestInMemoryRecorder_Record(t *testing.T) {
	tests := []struct {
		name   string
		events []billing.UsageEvent
	}{
		{
			name:   "no events",
			events: nil,
		},
		{
			name: "single event",
			events: []billing.UsageEvent{
				{AccountID: "org1", Quantity: 100, SKU: "actions-minutes", RecordedAt: time.Now()},
			},
		},
		{
			name: "multiple events",
			events: []billing.UsageEvent{
				{AccountID: "org1", Quantity: 50, SKU: "actions-minutes", RecordedAt: time.Now()},
				{AccountID: "org2", Quantity: 200, SKU: "packages-storage", RecordedAt: time.Now()},
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			r := &billing.InMemoryRecorder{}
			for _, e := range tc.events {
				if err := r.Record(e); err != nil {
					t.Fatalf("Record() returned unexpected error: %v", err)
				}
			}
			if got, want := len(r.Events), len(tc.events); got != want {
				t.Errorf("len(Events) = %d, want %d", got, want)
			}
		})
	}
}
