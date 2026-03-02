#!/bin/bash
# Digital Wallet API Example Usage
# Demonstrates wallet creation, balance, stamps, transfers, and history

echo "=== Stampcoin Digital Wallet Demo ==="
echo ""

BASE_URL="http://localhost:8080/api"

# Step 1: Create wallets
echo "1. Creating wallets..."
curl -X POST $BASE_URL/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user001", "userName": "Alice Smith"}' | jq .
echo ""

curl -X POST $BASE_URL/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user002", "userName": "Bob Jones"}' | jq .
echo ""

# Step 2: Add balance
echo "2. Adding balance..."
curl -X POST $BASE_URL/wallets/user001/balance \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}' | jq .
echo ""

curl -X POST $BASE_URL/wallets/user002/balance \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}' | jq .
echo ""

# Step 3: Add stamps
echo "3. Adding digital stamps..."
curl -X POST $BASE_URL/wallets/user001/stamps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classic Stamp 2024",
    "value": 150,
    "rarity": "rare",
    "description": "A rare classic stamp from 2024"
  }' | jq .
echo ""

curl -X POST $BASE_URL/wallets/user001/stamps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vintage Classic 1960",
    "value": 200,
    "rarity": "legendary",
    "description": "Rare vintage stamp from 1960"
  }' | jq .
echo ""

# Step 4: View wallets
echo "4. Viewing all wallets..."
curl -s $BASE_URL/wallets | jq .
echo ""

# Step 5: Transfer balance
echo "5. Transferring 100 credits from user001 to user002..."
curl -X POST $BASE_URL/wallets/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromUserId": "user001", "toUserId": "user002", "amount": 100}' | jq .
echo ""

# Step 6: View transaction history
echo "6. Viewing transaction history..."
curl -s $BASE_URL/transactions | jq .
echo ""

# Step 7: Final wallet states
echo "7. Final wallet states:"
echo ""
echo "User 001 wallet:"
curl -s $BASE_URL/wallets/user001 | jq .
echo ""
echo "User 002 wallet:"
curl -s $BASE_URL/wallets/user002 | jq .
echo ""

echo "=== Demo Complete ==="
