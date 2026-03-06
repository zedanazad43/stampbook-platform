// Package testing provides shared test helpers and fixtures for the
// metered usage ingestion service.
package testing

import (
	"time"

	"github.com/zedanazad43/stp/lib/billing"
)

// NewUsageEvent returns a UsageEvent with sensible defaults for use in tests.
// Any zero-value fields in overrides are replaced by the defaults.
func NewUsageEvent(accountID, sku string, quantity int64) billing.UsageEvent {
	return billing.UsageEvent{
		AccountID:  accountID,
		SKU:        sku,
		Quantity:   quantity,
		RecordedAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
	}
}
