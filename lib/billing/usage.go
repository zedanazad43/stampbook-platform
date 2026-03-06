// Package billing provides core types and logic for recording metered usage.
package billing

import "time"

// UsageEvent represents a single metered usage event to be ingested.
type UsageEvent struct {
	// AccountID is the GitHub account (org or user) the usage is associated with.
	AccountID string
	// Quantity is the number of units consumed.
	Quantity int64
	// SKU identifies the billable product or feature.
	SKU string
	// RecordedAt is the timestamp when the usage occurred.
	RecordedAt time.Time
}

// Recorder persists usage events.
type Recorder interface {
	Record(event UsageEvent) error
}

// InMemoryRecorder stores usage events in memory; useful for testing.
type InMemoryRecorder struct {
	Events []UsageEvent
}

// Record appends the event to the in-memory slice.
func (r *InMemoryRecorder) Record(event UsageEvent) error {
	r.Events = append(r.Events, event)
	return nil
}
