# Blockchain API – StampCoin (STP)

The Blockchain API exposes BEP-20 token and minting endpoints for the StampCoin (STP)
platform, deployed on **BNB Smart Chain (BSC)** using **Proof of Staked Authority (PoSA)** consensus.

---

## Blockchain Platform

| Property        | Value                              |
|-----------------|------------------------------------|
| Blockchain      | BNB Smart Chain (BSC)              |
| Standard        | BEP-20                             |
| Consensus       | Proof of Staked Authority (PoSA)   |
| Chain ID        | 56                                 |
| Token Name      | StampCoin                          |
| Symbol          | STP                                |
| Decimals        | 18                                 |
| Total Supply    | 421,000,000 STP                    |

---

## Smart Contract

The BEP-20 Solidity smart contract is located at `contracts/STP.sol`.
It implements the full `IBEP20` interface with a hard-cap mint function
restricted to the contract owner.

---

## Endpoints

### GET `/api/blockchain/info`

Returns token and blockchain metadata.

**Response:**
```json
{
  "name": "StampCoin",
  "symbol": "STP",
  "decimals": 18,
  "totalSupply": 421000000,
  "blockchain": "BNB Smart Chain",
  "consensus": "Proof of Staked Authority (PoSA)",
  "standard": "BEP-20",
  "network": "BSC Mainnet",
  "chainId": 56,
  "contractAddress": "Pending mainnet deployment"
}
```

---

### GET `/api/blockchain/supply`

Returns current minted supply vs the hard cap.

**Response:**
```json
{
  "totalSupply": 421000000,
  "mintedSupply": 0,
  "remainingSupply": 421000000,
  "symbol": "STP",
  "decimals": 18
}
```

---

### POST `/api/blockchain/mint` *(requires auth token)*

Mint STP tokens to an address. Protected by `SYNC_TOKEN` authorization.

**Request body:**
```json
{
  "toAddress": "user123",
  "amount": 1000
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "mint",
  "to": "user123",
  "amount": 1000,
  "timestamp": "2026-03-06T15:34:12.747Z"
}
```

**Error responses:**
- `400` – missing/invalid `toAddress` or `amount`, or supply cap exceeded
- `401` – missing or invalid auth token

---

### GET `/api/blockchain/balance/:address`

Returns the STP token balance for a given address.

**Response:**
```json
{
  "address": "user123",
  "balance": 1000,
  "symbol": "STP"
}
```

**Error responses:**
- `400` – invalid address

---

### GET `/api/blockchain/mint/events` *(requires auth token)*

Returns all mint events (full audit log).

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "mint",
    "to": "user123",
    "amount": 1000,
    "timestamp": "2026-03-06T15:34:12.747Z"
  }
]
```

**Error responses:**
- `401` – missing or invalid auth token

---

## Token Distribution

| Allocation           | %   | Amount (STP) |
|----------------------|-----|--------------|
| Public ICO Sale      | 20% | 84,200,000   |
| Ecosystem & Partners | 20% | 84,200,000   |
| Community & Rewards  | 20% | 84,200,000   |
| Liquidity Pool       | 15% | 63,150,000   |
| Team & Founders      | 15% | 63,150,000   |
| Reserve              | 10% | 42,100,000   |

---

## Environment Variables

| Variable              | Description                                        |
|-----------------------|----------------------------------------------------|
| `STP_CONTRACT_ADDRESS`| On-chain BEP-20 contract address after deployment  |
| `SYNC_TOKEN`          | Bearer token required for protected mint endpoints |
