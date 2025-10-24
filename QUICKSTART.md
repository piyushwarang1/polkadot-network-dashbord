# BeaconBlock - Quick Start Guide

Get your BeaconBlock blockchain explorer dashboard up and running in minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 19.2 and React DOM
- @polkadot/api for blockchain connections
- All necessary build tools

### 2. Start Development Server

```bash
npm start
```

The application will automatically open at `http://localhost:3000`

### 3. View Your Dashboard

Once the app loads, you'll see:
- **Connection Screen**: "Connecting to Polkadot Network..."
- **Dashboard**: Live data from Polkadot mainnet within seconds

## 🎯 What You'll See

### Navigation Bar (Top)
- **BeaconBlock Logo**: Branding and home link
- **Chain Selector**: Switch between Polkadot, Kusama, and Westend
- **Search Bar**: Search for blocks, extrinsics, and accounts
- **Nav Links**: Blockchain, Validators, Analytics, API

### Hero Stats (Top Section)
Five large metric cards showing:
1. **Latest Block**: Current block height
2. **Block Time**: Average time between blocks
3. **Active Validators**: Number of validators securing the network
4. **Total Transactions**: Network activity metric
5. **Network Health**: Overall system status

### Main Content (Left Column)

#### Recent Blocks
- Live table of the 10 most recent blocks
- Shows: Block number, timestamp, extrinsics count, validator
- Updates in real-time as new blocks are produced

#### Recent Extrinsics
- Feed of recent blockchain transactions
- Shows: Extrinsic ID, block number, action type, success/failure status
- Color-coded badges for quick status recognition

### Sidebar (Right Column)

#### Network Status
- Overall system health indicator
- Individual subsystem status:
  - Block Production
  - Finalization
  - RPC Nodes
  - Network Sync

#### Chain Information
- Chain name and network details
- Token symbol and decimals
- Runtime version and spec
- SS58 address format

#### Quick Stats
- Finalized blocks count
- Connected peers
- Network uptime
- Average block time

## 🔄 Switching Chains

1. Click the **chain selector** in the navigation bar
2. Choose from:
   - 🔵 **Polkadot** - Production relay chain
   - 🟡 **Kusama** - Canary network
   - 🟣 **Westend** - Test network

> **Note**: Chain switching will trigger a reconnection. This may take a few seconds.

## 📱 Responsive Design

The dashboard automatically adapts to your screen:

- **Desktop** (>992px): Full two-column layout with sidebar
- **Tablet** (768-992px): Stacked layout, simplified navigation
- **Mobile** (<768px): Single column, optimized for touch

## 🛠️ Development Commands

```bash
# Start development server with hot reload
npm start

# Run tests
npm test

# Build production bundle
npm run build

# Serve production build locally
npx serve -s build
```

## 🎨 Customization

### Change Default Chain

Edit `src/hooks/usePolkadotApi.js`:

```javascript
const endpoint = customEndpoint || 'wss://your-preferred-chain.com';
```

### Add More Chains to Selector

Edit `src/components/Navigation.js`:

```javascript
const chains = [
  { name: 'Polkadot', endpoint: 'wss://rpc.polkadot.io', icon: '🔵' },
  { name: 'Your Chain', endpoint: 'wss://your-chain.com', icon: '🟢' }
];
```

### Customize Theme Colors

Edit `src/App.css` - look for color variables:

```css
/* Primary brand color */
color: #2E4C9A;

/* Success color */
color: #00D092;

/* Background */
background: #F7F9FC;
```

## 🔍 Troubleshooting

### "Connection Error" on startup

**Possible causes:**
1. No internet connection
2. RPC endpoint is down
3. Firewall blocking WebSocket connections

**Solutions:**
- Check your internet connection
- Try a different chain from the selector
- Verify WebSocket connections aren't blocked

### Slow initial load

**Why**: The app is:
1. Connecting to the blockchain via WebSocket
2. Retrieving chain metadata
3. Subscribing to block updates

**Normal load time**: 2-5 seconds for first connection

### Data not updating

**Check**:
1. WebSocket connection status (shown in Network Status sidebar)
2. Browser console for error messages
3. Try refreshing the page

## 📊 Understanding the Data

### Block Numbers
- Sequential height of the blockchain
- Increases with each new block (every ~6 seconds on Polkadot)
- Click any block number to view details

### Extrinsics
- Blockchain transactions and operations
- Can be transfers, governance votes, staking operations, etc.
- Format: `section.method` (e.g., `balances.transfer`)

### Validators
- Network nodes that produce and validate blocks
- Shortened addresses shown (e.g., `5GNJqTP...`)
- Full address visible on hover (planned feature)

### Network Health
- **Operational**: All systems working normally
- Updates if issues detected with block production or finalization

## 🚧 What's Next?

Current version supports:
- ✅ Real-time block monitoring
- ✅ Live extrinsic tracking
- ✅ Multi-chain selector (3 chains)
- ✅ Network status monitoring

Coming soon:
- 🔲 User-added custom chains
- 🔲 Transaction builder
- 🔲 Account explorer
- 🔲 Historical charts
- 🔲 Validator analytics

See `DYNAMIC_INTEGRATION_GUIDE.md` for implementing custom chain support.

## 💡 Tips

1. **Best Performance**: Use Chrome or Firefox latest versions
2. **Secure Connections**: Look for WSS (not WS) in endpoints
3. **Multiple Monitors**: Dashboard works great on wide screens
4. **Mobile Use**: Rotate to landscape for table views
5. **Bookmarking**: Save specific chain views for quick access

## 🆘 Getting Help

- **Documentation**: See `README.md` for detailed information
- **Integration Guide**: See `DYNAMIC_INTEGRATION_GUIDE.md`
- **Issues**: Open an issue on GitHub
- **Community**: Join our Discord (link in footer)

## 📝 Quick Reference

### Useful Endpoints
```
Polkadot:  wss://rpc.polkadot.io
Kusama:    wss://kusama-rpc.polkadot.io
Westend:   wss://westend-rpc.polkadot.io
Rococo:    wss://rococo-rpc.polkadot.io
```

### Project Structure
```
src/
├── components/       # UI components
│   ├── Navigation.js
│   ├── HeroStats.js
│   ├── RecentBlocks.js
│   ├── RecentExtrinsics.js
│   └── ...
├── hooks/           # Custom React hooks
│   └── usePolkadotApi.js
├── App.js           # Main application
└── App.css          # Styling
```

---

**You're all set!** 🎉

BeaconBlock is now running and monitoring the Substrate blockchain ecosystem in real-time. Explore the dashboard, switch chains, and watch as blocks are produced every few seconds.

For advanced features and customization, check out the full documentation in `README.md`.
