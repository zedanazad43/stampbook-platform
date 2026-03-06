GOFMT_FILES ?= $$(find . -name '*.go' -not -path './vendor/*')

.PHONY: build
build:
	go build ./...

.PHONY: test
test:
	go test ./...

.PHONY: fmt
fmt:
	gofmt -w $(GOFMT_FILES)

.PHONY: lint
lint:
	go vet ./...

.PHONY: ci
ci: build fmt lint test

.PHONY: proto
proto:
	protoc --go_out=. --go-grpc_out=. proto/*.proto
