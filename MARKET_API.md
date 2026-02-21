# Market Institution API (مؤسسة السوق)

## Overview / نظرة عامة

The Market Institution API provides endpoints for managing a digital marketplace where users can list, browse, and purchase digital stamps and collectibles.

توفر واجهة برمجة تطبيقات مؤسسة السوق نقاط نهاية لإدارة سوق رقمية حيث يمكن للمستخدمين إدراج وتصفح وشراء الطوابع والمقتنيات الرقمية.

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

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/market/items/item_1234567890_abc123"
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
  "imageUrl": "https://example.com/image.jpg",
  "status": "available",
  "listedAt": "2026-02-07T21:25:31.333Z"
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
  "item": {
    "name": "Rare Stamp 1",
    "description": "Vintage 1950s stamp",
    "price": 100,
    "type": "stamp",
    "imageUrl": "https://example.com/image.jpg"
  }
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/market/items" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "user123",
    "item": {
      "name": "Rare Stamp 1",
      "description": "Vintage 1950s stamp",
      "price": 100,
      "type": "stamp"
    }
  }'
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

Update an existing market item (price, description, status, etc.)

**Request Body:**
```json
{
  "price": 120,
  "description": "Updated description",
  "status": "available"
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:8080/api/market/items/item_1234567890_abc123" \
  -H "Content-Type: application/json" \
  -d '{"price": 120, "description": "Updated vintage stamp"}'
```

**Example Response:**
```json
{
  "id": "item_1234567890_abc123",
  "sellerId": "user123",
  "name": "Rare Stamp 1",
  "description": "Updated vintage stamp",
  "price": 120,
  "type": "stamp",
  "imageUrl": "",
  "status": "available",
  "listedAt": "2026-02-07T21:25:31.333Z"
}
```

---

### 5. Purchase Market Item

**POST** `/api/market/items/:itemId/purchase`

Purchase an item from the market.

**Request Body:**
```json
{
  "buyerId": "user456"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/market/items/item_1234567890_abc123/purchase" \
  -H "Content-Type: application/json" \
  -d '{"buyerId": "user456"}'
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
    "description": "Vintage 1950s stamp",
    "price": 100,
    "type": "stamp",
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

**Example Request:**
```bash
curl -X DELETE "http://localhost:8080/api/market/items/item_1234567890_abc123" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
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
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Usage Examples / أمثلة الاستخدام

### Complete workflow example:

```bash
# 1. Add an item to the market
curl -X POST "http://localhost:8080/api/market/items" \
  -H "Content-Type: application/json" \
  -d '{"sellerId": "seller1", "item": {"name": "Stamp A", "price": 50, "type": "stamp"}}'

# 2. List all available items
curl -X GET "http://localhost:8080/api/market/items?status=available"

# 3. Purchase an item
curl -X POST "http://localhost:8080/api/market/items/ITEM_ID/purchase" \
  -H "Content-Type: application/json" \
  -d '{"buyerId": "buyer1"}'

# 4. View transaction history
curl -X GET "http://localhost:8080/api/market/transactions"
```

---

## Integration with Wallet API

The Market Institution API works seamlessly with the Wallet API. When purchasing items, ensure:
1. Buyer has sufficient balance in their wallet
2. Transactions are recorded in both market and wallet systems
3. Stamps are transferred from seller to buyer

For wallet operations, see [WALLET_API.md](WALLET_API.md)

---

## Security Notes / ملاحظات الأمان

- Always validate user IDs before processing transactions
- Implement authentication in production environments
- Use HTTPS for all API calls in production
- Set appropriate CORS policies
- Never expose sensitive seller/buyer information

---

## See Also

- [WALLET_API.md](WALLET_API.md) - Digital Wallet API documentation
- [README.md](README.md) - General platform documentation
- [INSTALLATION.md](INSTALLATION.md) - Installation instructions
