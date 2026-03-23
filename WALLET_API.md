# Digital Wallet API Documentation
# واجهة برمجة تطبيقات المحفظة الرقمية

## Overview | نظرة عامة

The Digital Wallet API provides endpoints for managing digital wallets, balances, stamps, and peer-to-peer transfers in the Stampcoin platform.

## Base URL

```
http://localhost:8080/api
```

## Authentication

Protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <SYNC_TOKEN>
```

## Endpoints | نقاط النهاية

### 1. Create Wallet | إنشاء محفظة

**POST** `/api/wallet/create`

Create a new digital wallet for a user.

**Request Body:**
```json
{
  "userId": "user123",
  "userName": "Ahmed Ali"
}
```

**Response (200 OK):**
```json
{
  "userId": "user123",
  "userName": "Ahmed Ali",
  "balance": 0,
  "stamps": [],
  "createdAt": "2026-02-07T18:35:00.000Z",
  "updatedAt": "2026-02-07T18:35:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Wallet already exists for this user"
}
```

---

### 2. Get Wallet | الحصول على المحفظة

**GET** `/api/wallet/:userId`

Retrieve wallet information for a specific user.

**Response (200 OK):**
```json
{
  "userId": "user123",
  "userName": "Ahmed Ali",
  "balance": 150,
  "stamps": [
    {
      "id": "stamp-uuid-1",
      "name": "Vintage 1960 Stamp",
      "value": 50,
      "rarity": "rare",
      "addedAt": "2026-02-07T18:35:00.000Z"
    }
  ],
  "createdAt": "2026-02-07T18:35:00.000Z",
  "updatedAt": "2026-02-07T18:40:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Wallet not found"
}
```

---

### 3. Get All Wallets | الحصول على جميع المحافظ (Admin)

**GET** `/api/wallets`

🔒 **Requires authentication** — token-protected admin endpoint.

Retrieve all wallets in the system.

**Response (200 OK):**
```json
{
  "user123": {
    "userId": "user123",
    "userName": "Ahmed Ali",
    "balance": 150,
    "stamps": [],
    "createdAt": "2026-02-07T18:35:00.000Z",
    "updatedAt": "2026-02-07T18:40:00.000Z"
  },
  "user456": {
    "userId": "user456",
    "userName": "Sara Mohammed",
    "balance": 200,
    "stamps": [],
    "createdAt": "2026-02-07T18:35:00.000Z",
    "updatedAt": "2026-02-07T18:40:00.000Z"
  }
}
```

---

### 4. Transfer | التحويل

**POST** `/api/wallet/transfer`

Transfer balance between wallets.

**Request Body:**
```json
{
  "fromUserId": "user123",
  "toUserId": "user456",
  "amount": 50
}
```

**Response (200 OK):**
```json
{
  "id": "transaction-uuid-1",
  "from": "user123",
  "to": "user456",
  "amount": 50,
  "stampId": null,
  "timestamp": "2026-02-07T18:55:00.000Z",
  "status": "completed"
}
```

---

### 5. Get Transaction History | الحصول على سجل المعاملات

**GET** `/api/wallet/:userId/transactions`

Retrieve transaction history for a specific user.

**Response (200 OK):**
```json
[
  {
    "id": "transaction-uuid-1",
    "from": "user123",
    "to": "user456",
    "amount": 50,
    "stampId": null,
    "timestamp": "2026-02-07T18:55:00.000Z",
    "status": "completed"
  }
]
```

---

### 6. Add Stamp to Wallet | إضافة طابع إلى المحفظة

**POST** `/api/wallet/:userId/stamps`

🔒 **Requires authentication** — token-protected to prevent unauthorized stamp minting.

Add a digital stamp to a user's wallet.

**Request Body:**
```json
{
  "name": "Olympic Games 2024",
  "value": 75,
  "rarity": "limited",
  "description": "Commemorative Olympic stamp",
  "imageUrl": "https://example.com/stamp.jpg"
}
```

**Response (200 OK):**
```json
{
  "userId": "user123",
  "userName": "Ahmed Ali",
  "balance": 150,
  "stamps": [
    {
      "id": "stamp-uuid-2",
      "name": "Olympic Games 2024",
      "value": 75,
      "rarity": "limited",
      "description": "Commemorative Olympic stamp",
      "imageUrl": "https://example.com/stamp.jpg",
      "addedAt": "2026-02-07T18:50:00.000Z"
    }
  ],
  "updatedAt": "2026-02-07T18:50:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Wallet not found"
}
```

---

### 7. Top Up Balance | شحن الرصيد

**POST** `/api/wallet/:userId/topup`

🔒 **Requires authentication**.

Add balance to a wallet.

**Request Body:**
```json
{
  "amount": 1000
}
```

**Response (200 OK):**
```json
{
  "userId": "user123",
  "balance": 1150,
  "updatedAt": "2026-02-07T18:45:00.000Z"
}
```

---

## Data Models | نماذج البيانات

### Wallet Object

```typescript
{
  userId: string,          // Unique user identifier
  userName: string,        // User display name
  balance: number,         // Current balance in credits
  stamps: Stamp[],         // Array of digital stamps
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

### Stamp Object

```typescript
{
  id: string,              // Auto-generated UUID
  name: string,            // Stamp name (required)
  value?: number,          // Stamp value in credits
  rarity?: string,         // Rarity level
  description?: string,    // Description
  imageUrl?: string,       // Image URL
  addedAt: string,         // ISO timestamp when added
  transferredAt?: string   // ISO timestamp if transferred
}
```

### Transaction Object

```typescript
{
  id: string,              // Transaction UUID
  from: string,            // Sender userId
  to: string,              // Receiver userId
  amount: number,          // Amount transferred
  stampId: string | null,  // Stamp ID if transferring a stamp
  timestamp: string,       // ISO timestamp
  status: string           // "completed"
}
```

---

## Error Codes

- **400 Bad Request**: Invalid input or business rule violation
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Wallet not found
- **500 Internal Server Error**: Server error

---

## Example Usage

```bash
# Create wallet
curl -X POST http://localhost:8080/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "userName": "Ahmed Ali"}'

# Add stamp (requires token)
curl -X POST http://localhost:8080/api/wallet/user123/stamps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Vintage 1960", "value": 100, "rarity": "rare"}'

# List all wallets (admin, requires token)
curl -X GET http://localhost:8080/api/wallets \
  -H "Authorization: Bearer <token>"

# Transfer balance
curl -X POST http://localhost:8080/api/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromUserId": "user123", "toUserId": "user456", "amount": 50}'
```

## See Also

- [MARKET_API.md](MARKET_API.md) — Market Institution API documentation
- [README.md](README.md) — General platform documentation
