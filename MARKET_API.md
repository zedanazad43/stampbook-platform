# Market Institution API (مؤسسة السوق)

## Overview / نظرة عامة

The Market Institution API provides endpoints for managing a digital marketplace where users can list, browse, update, and purchase digital stamps and collectibles.

## Base URL

```
http://localhost:8080/api/market
```

## Endpoints

### 1. Get All Market Items

**GET** `/api/market/items`

Get a list of all items in the market with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by item status (`available`, `sold`)
- `type` (optional): Filter by item type (e.g., `stamp`, `collectible`)
- `sellerId` (optional): Filter by seller user ID

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/market/items?status=available"
```

**Example Response:**
```json
[
  {
    "id": "item_1234567890_abc123",
    "sellerId": "user123",
    "name": "Rare Stamp 1",
    "description": "Vintage 1950s stamp",
    "price": 100,
    "type": "stamp",
    "imageUrl": "https://example.com/image.jpg",
    "status": "available",
    "listedAt": "2026-02-07T21:25:31.333Z"
  }
]
```

---

### 2. Get Market Item by ID

**GET** `/api/market/items/:itemId`

Get details of a specific market item.

**Example Response:**
```json
{
  "id": "item_1234567890_abc123",
  "sellerId": "user123",
  "name": "Rare Stamp 1",
  "description": "Vintage 1950s stamp",
  "price": 100,
  "type": "stamp",
  "imageUrl": "https://example.com/image.jpg",
  "status": "available",
  "listedAt": "2026-02-07T21:25:31.333Z"
}
```

**Error Response (404):**
```json
{
  "error": "Market item not found"
}
```

---

### 3. Add Item to Market

**POST** `/api/market/items`

List a new item for sale in the market.

**Request Body:**
```json
{
  "sellerId": "user123",
  "name": "Rare Stamp 1",
  "description": "Vintage 1950s stamp",
  "price": 100,
  "type": "stamp",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Example Response:**
```json
{
  "id": "item_1234567890_abc123",
  "sellerId": "user123",
  "name": "Rare Stamp 1",
  "description": "Vintage 1950s stamp",
  "price": 100,
  "type": "stamp",
  "imageUrl": "",
  "status": "available",
  "listedAt": "2026-02-07T21:25:31.333Z"
}
```

---

### 4. Update Market Item

**PUT** `/api/market/items/:itemId`

Update an existing market item. Only the seller can update their own listing.

**Request Body:**
```json
{
  "userId": "user123",
  "price": 120,
  "description": "Updated description",
  "status": "available",
  "imageUrl": "https://example.com/new-image.jpg"
}
```

- `userId` (required): Must match the item's `sellerId`.
- `price`, `description`, `status`, `imageUrl`: At least one must be provided.

**Example Response:**
```json
{
  "id": "item_1234567890_abc123",
  "sellerId": "user123",
  "name": "Rare Stamp 1",
  "description": "Updated description",
  "price": 120,
  "type": "stamp",
  "imageUrl": "https://example.com/new-image.jpg",
  "status": "available",
  "listedAt": "2026-02-07T21:25:31.333Z"
}
```

**Error Responses:**
- `400` — `userId` missing or no updatable fields provided
- `403` — caller is not the seller
- `404` — item not found

---

### 5. Purchase Market Item

**POST** `/api/market/items/:itemId/buy`

Purchase an item from the market. If the item has a price > 0, the buyer's wallet balance is transferred to the seller.

**Request Body:**
```json
{
  "buyerId": "user456"
}
```

**Example Response:**
```json
{
  "transaction": {
    "id": "txn_1234567890_xyz789",
    "itemId": "item_1234567890_abc123",
    "sellerId": "user123",
    "buyerId": "user456",
    "price": 100,
    "timestamp": "2026-02-07T21:26:00.000Z"
  },
  "item": {
    "id": "item_1234567890_abc123",
    "sellerId": "user123",
    "name": "Rare Stamp 1",
    "status": "sold"
  }
}
```

---

### 6. Remove Market Item

**DELETE** `/api/market/items/:itemId`

Remove an item from the market (seller only).

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Item removed from market"
}
```

---

### 7. Get Market Transaction History

**GET** `/api/market/transactions`

Get the history of all market transactions with optional filtering.

**Query Parameters:**
- `buyerId` (optional): Filter by buyer user ID
- `sellerId` (optional): Filter by seller user ID

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/market/transactions?buyerId=user456"
```

**Example Response:**
```json
[
  {
    "id": "txn_1234567890_xyz789",
    "itemId": "item_1234567890_abc123",
    "sellerId": "user123",
    "buyerId": "user456",
    "price": 100,
    "timestamp": "2026-02-07T21:26:00.000Z"
  }
]
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` — Success
- `201` — Created
- `400` — Bad Request (invalid parameters)
- `403` — Forbidden (not the item owner)
- `404` — Not Found
- `500` — Internal Server Error

---

## Usage Examples

```bash
# 1. Add an item to the market
curl -X POST "http://localhost:8080/api/market/items" \
  -H "Content-Type: application/json" \
  -d '{"sellerId": "seller1", "name": "Stamp A", "price": 50, "type": "stamp"}'

# 2. List all available items
curl -X GET "http://localhost:8080/api/market/items?status=available"

# 3. Update an item (seller only)
curl -X PUT "http://localhost:8080/api/market/items/ITEM_ID" \
  -H "Content-Type: application/json" \
  -d '{"userId": "seller1", "price": 75, "description": "Updated description"}'

# 4. Purchase an item
curl -X POST "http://localhost:8080/api/market/items/ITEM_ID/buy" \
  -H "Content-Type: application/json" \
  -d '{"buyerId": "buyer1"}'

# 5. View transaction history
curl -X GET "http://localhost:8080/api/market/transactions"

# 6. View transaction history for a specific buyer
curl -X GET "http://localhost:8080/api/market/transactions?buyerId=buyer1"
```

---

## See Also

- [WALLET_API.md](WALLET_API.md) — Digital Wallet API documentation
- [README.md](README.md) — General platform documentation
