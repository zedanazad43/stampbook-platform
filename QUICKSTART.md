# Quick Start Guide -   
# Market Institution ( )

##   / Quick Start

### 1. Clone and Install /  

```bash
git clone https://github.com/zedanazad43/stp.git
cd stp
npm install
```

### 2. Run the Server /  

```bash
npm start
```

Server will start on http://localhost:8080

### 3. Test the Market API /    

```bash
# List all market items /    
curl http://localhost:8080/api/market/items

# Add a new item to market /    
curl -X POST http://localhost:8080/api/market/items \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "seller123",
    "item": {
      "name": "Rare Vintage Stamp",
      "description": "1950s collectible stamp",
      "price": 100,
      "type": "stamp"
    }
  }'

# Purchase an item /  
curl -X POST http://localhost:8080/api/market/items/ITEM_ID/purchase \
  -H "Content-Type: application/json" \
  -d '{"buyerId": "buyer123"}'
```

## Docker Quick Start /    Docker

```bash
# Build Docker image /   Docker
npm run docker:build

# Run Docker container /   Docker
npm run docker:run

# Test the API /  
curl http://localhost:8080/api/market/items
```

## Core Features /  

### Market Operations /  

1. **Add Item** - List items for sale /   
2. **Browse Items** - View all available items /    
3. **Purchase** - Buy items from the market /    
4. **Update Item** - Modify item details /   
5. **Remove Item** - Remove your listings /  
6. **Transaction History** - View purchase history /   

### Wallet Integration /  

```bash
# Create a wallet /  
curl -X POST http://localhost:8080/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "userName": "John Doe"}'

# Check wallet balance /   
curl http://localhost:8080/api/wallets/user123

# Add balance to wallet /   
curl -X POST http://localhost:8080/api/wallets/user123/balance \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

## API Documentation /  

For complete API documentation, see:
- [MARKET_API.md](MARKET_API.md) - Market Institution API
- [WALLET_API.md](WALLET_API.md) - Digital Wallet API
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment Guide

## Project Structure /  

```
stp/
 server.js           # Main server file /   
 market.js           # Market module /  
 wallet.js           # Wallet module /  
 package.json        # Dependencies / 
 Dockerfile          # Docker configuration /  Docker
 MARKET_API.md       # Market API docs /   
 WALLET_API.md       # Wallet API docs /   
 DEPLOYMENT.md       # Deployment guide /  
 README.md           # Project overview /  
```

## Environment Variables /  

```env
# Optional: Port number (default: 8080)
PORT=8080

# Optional: Authentication token for sync endpoints
SYNC_TOKEN=your_secure_token
```

## Available Scripts /   

```bash
npm start              # Start the server /  
npm run dev            # Development mode /  
npm run build          # Build for production /  
npm test               # Run tests /  
npm run docker:build   # Build Docker image /   Docker
npm run docker:run     # Run in Docker /   Docker
```

## Deployment Options /  

### 1. Local Development /  
```bash
npm install
npm start
```

### 2. Docker / 
```bash
docker build -t stampcoin-platform .
docker run -p 8080:8080 stampcoin-platform
```

### 3. Cloud Platforms /  
- Railway.app
- Fly.io
- Render.com
- Heroku
- AWS/Azure/GCP

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Testing Checklist /  

- [ ] Server starts successfully
- [ ] Market API endpoints respond
- [ ] Wallet API endpoints respond
- [ ] Can add items to market
- [ ] Can purchase items
- [ ] Can view transaction history
- [ ] Docker build succeeds
- [ ] Docker container runs

## Troubleshooting /  

### Server won't start /   
```bash
# Check if port 8080 is in use
lsof -ti:8080

# Kill process if needed
lsof -ti:8080 | xargs kill
```

### Module not found /   
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Docker issues /  Docker
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t stampcoin-platform .
```

## Next Steps /  

1.  Basic setup complete
2.  Explore the API endpoints
3.  Read full documentation
4.  Deploy to production
5.  Configure security settings
6.  Set up monitoring

## Support / 

-  Documentation: [README.md](README.md)
-  Issues: GitHub Issues
-  Discussions: GitHub Discussions

---

**Ready to Go! /  !** 

Start exploring the Market Institution API and build amazing digital marketplace applications!

            !
