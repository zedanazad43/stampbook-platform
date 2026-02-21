# Digital Wallet API Documentation
# واجهة برمجة تطبيقات المحفظة الرقمية

## Overview | نظرة عامة

The Digital Wallet API provides endpoints for managing digital wallets, balances, stamps, and peer-to-peer transfers in the Stampcoin platform.

توفر واجهة برمجة تطبيقات المحفظة الرقمية نقاط نهاية لإدارة المحافظ الرقمية والأرصدة والطوابع والتحويلات بين المستخدمين في منصة Stampcoin.

## Base URL

```
http://localhost:8080/api
```

## Endpoints | نقاط النهاية

### 1. Create Wallet | إنشاء محفظة

**POST** `/api/wallets`

Create a new digital wallet for a user.

**Request Body:**
```json
{
  "userId": "user123",
  "userName": "Ahmed Ali"
}
```

**Response (201 Created):**
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

**GET** `/api/wallets/:userId`

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

### 3. Get All Wallets | الحصول على جميع المحافظ

**GET** `/api/wallets`

Retrieve all wallets in the system.

**Response (200 OK):**
```json
{
  "user123": {
    "userId": "user123",
    "userName": "Ahmed Ali",
    "balance": 150,
    "stamps": [...],
    "createdAt": "2026-02-07T18:35:00.000Z",
    "updatedAt": "2026-02-07T18:40:00.000Z"
  },
  "user456": {
    "userId": "user456",
    "userName": "Sara Mohammed",
    "balance": 200,
    "stamps": [...],
    "createdAt": "2026-02-07T18:35:00.000Z",
    "updatedAt": "2026-02-07T18:40:00.000Z"
  }
}
```

---

### 4. Update Balance | تحديث الرصيد

**POST** `/api/wallets/:userId/balance`

Add or subtract from wallet balance.

**Request Body:**
```json
{
  "amount": 100
}
```

**Response (200 OK):**
```json
{
  "userId": "user123",
  "userName": "Ahmed Ali",
  "balance": 250,
  "stamps": [...],
  "updatedAt": "2026-02-07T18:45:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Insufficient balance"
}
```

---

### 5. Add Stamp to Wallet | إضافة طابع إلى المحفظة

**POST** `/api/wallets/:userId/stamps`

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
  "balance": 250,
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

---

### 6. Transfer | التحويل

**POST** `/api/wallets/transfer`

Transfer balance or stamps between wallets.

**Request Body (Balance Transfer):**
```json
{
  "fromUserId": "user123",
  "toUserId": "user456",
  "amount": 50
}
```

**Request Body (Stamp Transfer):**
```json
{
  "fromUserId": "user123",
  "toUserId": "user456",
  "stampId": "stamp-uuid-1"
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

**Error Response (400):**
```json
{
  "error": "Insufficient balance"
}
```

---

### 7. Get Transaction History | الحصول على سجل المعاملات

**GET** `/api/wallets/:userId/transactions`

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
  },
  {
    "id": "transaction-uuid-2",
    "from": "user789",
    "to": "user123",
    "amount": 100,
    "stampId": null,
    "timestamp": "2026-02-07T19:00:00.000Z",
    "status": "completed"
  }
]
```

---

### 8. Get All Transactions | الحصول على جميع المعاملات

**GET** `/api/transactions`

Retrieve all transactions in the system.

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

## Data Models | نماذج البيانات

### Wallet Object | كائن المحفظة

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

### Stamp Object | كائن الطابع

```typescript
{
  id: string,              // Auto-generated UUID
  name: string,            // Stamp name
  value?: number,          // Stamp value in credits
  rarity?: string,         // Rarity level
  description?: string,    // Description
  imageUrl?: string,       // Image URL
  addedAt: string,         // ISO timestamp when added
  transferredAt?: string   // ISO timestamp if transferred
}
```

### Transaction Object | كائن المعاملة

```typescript
{
  id: string,              // Transaction UUID
  from: string,            // Sender userId
  to: string,              // Receiver userId
  amount: number,          // Amount transferred (0 if stamp-only)
  stampId: string | null,  // Stamp ID if transferring a stamp
  timestamp: string,       // ISO timestamp
  status: string           // Transaction status (completed, pending, failed)
}
```

---

## Example Usage | أمثلة الاستخدام

### Create and Fund a Wallet

```bash
# Create wallet
curl -X POST http://localhost:8080/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "userName": "Ahmed Ali"}'

# Add balance
curl -X POST http://localhost:8080/api/wallets/user123/balance \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'

# Add stamp
curl -X POST http://localhost:8080/api/wallets/user123/stamps \
  -H "Content-Type: application/json" \
  -d '{"name": "Vintage 1960", "value": 100, "rarity": "rare"}'
```

### Transfer Between Users

```bash
# Create second wallet
curl -X POST http://localhost:8080/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user456", "userName": "Sara Mohammed"}'

# Transfer balance
curl -X POST http://localhost:8080/api/wallets/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromUserId": "user123", "toUserId": "user456", "amount": 50}'
```

---

## Error Codes | رموز الخطأ

- **400 Bad Request**: Invalid input or business rule violation
- **404 Not Found**: Wallet not found
- **500 Internal Server Error**: Server error

---

## Security Considerations | اعتبارات الأمان

1. In production, implement authentication and authorization
2. Use HTTPS for all API calls
3. Validate all input data
4. Implement rate limiting
5. Add transaction signatures for enhanced security

**Concurrency Note**: The current implementation uses file-based storage without locking mechanisms. For production use with concurrent access, consider:
- Implementing file locking (e.g., using `proper-lockfile` npm package)
- Migrating to a database with transaction support (PostgreSQL, MongoDB, etc.)
- Using a queue system for wallet operations to serialize transactions

## Future Enhancements | التحسينات المستقبلية

- Add wallet authentication with JWT tokens
- Implement transaction rollback functionality
- Add stamp marketplace integration
- Support multi-currency wallets
- Add transaction fees and commissions
- Implement wallet backup and recovery
