# Dynamic Chain Integration - Implementation Guide

This guide provides detailed instructions for extending BeaconBlock with full user-driven dynamic chain integration capabilities.

## Overview

Currently, BeaconBlock connects to predefined chains (Polkadot, Kusama, Westend). This guide shows how to implement the full vision: allowing users to add **any** Substrate chain by simply providing a WebSocket RPC endpoint.

## Architecture Components

### 1. ChainManager Service

Create a centralized service to manage all chain connections:

**File**: `src/services/ChainManager.js`

```javascript
import { ApiPromise, WsProvider } from '@polkadot/api';

class ChainManager {
  constructor() {
    this.connections = new Map(); // endpoint -> connection data
    this.chainsByHash = new Map(); // genesisHash -> chain data
  }

  async addChain(endpoint, customName = null) {
    try {
      // Validate endpoint
      if (!this.isValidEndpoint(endpoint)) {
        throw new Error('Invalid WebSocket endpoint format');
      }

      // Check if already connected
      if (this.connections.has(endpoint)) {
        return this.connections.get(endpoint);
      }

      // Create connection
      const provider = new WsProvider(endpoint, 1000);
      const api = await ApiPromise.create({ provider });

      // Retrieve chain metadata
      const metadata = await this.retrieveChainMetadata(api);
      
      const chainData = {
        api,
        provider,
        endpoint,
        customName,
        metadata,
        timestamp: Date.now(),
        status: 'connected'
      };

      this.connections.set(endpoint, chainData);
      this.chainsByHash.set(metadata.genesisHash, chainData);

      return chainData;
    } catch (error) {
      throw new Error(`Failed to connect to chain: ${error.message}`);
    }
  }

  async retrieveChainMetadata(api) {
    const [chain, properties, genesisHash, runtimeVersion, health, lastHeader] = 
      await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.properties(),
        api.genesisHash,
        api.runtimeVersion,
        api.rpc.system.health(),
        api.rpc.chain.getHeader()
      ]);

    return {
      chainName: chain.toString(),
      tokenSymbol: properties.tokenSymbol?.toString() || properties.tokenSymbol?.toJSON()?.[0] || 'UNIT',
      tokenDecimals: properties.tokenDecimals?.toJSON()?.[0] || 10,
      ss58Format: properties.ss58Format?.toJSON() || 42,
      genesisHash: genesisHash.toHex(),
      runtimeVersion: runtimeVersion.specVersion.toNumber(),
      specName: runtimeVersion.specName.toString(),
      implName: runtimeVersion.implName.toString(),
      currentBlock: lastHeader.number.toNumber(),
      peers: health.peers.toNumber(),
      isSyncing: health.isSyncing.isTrue
    };
  }

  isValidEndpoint(endpoint) {
    try {
      const url = new URL(endpoint);
      return url.protocol === 'ws:' || url.protocol === 'wss:';
    } catch {
      return false;
    }
  }

  async disconnectChain(endpoint) {
    const chain = this.connections.get(endpoint);
    if (chain) {
      await chain.api.disconnect();
      this.connections.delete(endpoint);
      this.chainsByHash.delete(chain.metadata.genesisHash);
    }
  }

  getChainByEndpoint(endpoint) {
    return this.connections.get(endpoint);
  }

  getChainByHash(genesisHash) {
    return this.chainsByHash.get(genesisHash);
  }

  getAllChains() {
    return Array.from(this.connections.values());
  }
}

export default new ChainManager();
```

### 2. Chain Storage Service

Store user-added chains persistently:

**File**: `src/services/ChainStorage.js`

```javascript
const STORAGE_KEY = 'beaconblock_custom_chains';

export const ChainStorage = {
  saveChain(endpoint, customName, trusted = false) {
    const chains = this.getChains();
    const existing = chains.find(c => c.endpoint === endpoint);
    
    if (!existing) {
      chains.push({
        endpoint,
        customName,
        trusted,
        addedAt: Date.now()
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chains));
    }
  },

  getChains() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  removeChain(endpoint) {
    const chains = this.getChains().filter(c => c.endpoint !== endpoint);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chains));
  },

  updateChainTrust(endpoint, trusted) {
    const chains = this.getChains();
    const chain = chains.find(c => c.endpoint === endpoint);
    if (chain) {
      chain.trusted = trusted;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chains));
    }
  },

  exportChains() {
    const data = JSON.stringify(this.getChains(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beaconblock-chains-${Date.now()}.json`;
    a.click();
  },

  importChains(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const chains = JSON.parse(e.target.result);
          const existing = this.getChains();
          const merged = [...existing];
          
          chains.forEach(newChain => {
            if (!merged.find(c => c.endpoint === newChain.endpoint)) {
              merged.push(newChain);
            }
          });
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          resolve(merged);
        } catch (error) {
          reject(new Error('Invalid chain configuration file'));
        }
      };
      reader.readAsText(file);
    });
  }
};
```

### 3. Add Chain Modal Component

**File**: `src/components/AddChainModal.js`

```javascript
import React, { useState } from 'react';

const AddChainModal = ({ isOpen, onClose, onAddChain }) => {
  const [endpoint, setEndpoint] = useState('');
  const [customName, setCustomName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsConnecting(true);

    try {
      // Validate endpoint format
      const url = new URL(endpoint);
      if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
        throw new Error('Endpoint must use ws:// or wss:// protocol');
      }

      // Warn for non-secure connections
      if (url.protocol === 'ws:' && !window.confirm(
        'You are connecting via insecure WebSocket (ws://). This may expose data. Continue?'
      )) {
        setIsConnecting(false);
        return;
      }

      await onAddChain(endpoint, customName || null);
      
      // Reset and close
      setEndpoint('');
      setCustomName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect to chain');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Custom Chain</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="endpoint">WebSocket Endpoint *</label>
            <input
              id="endpoint"
              type="text"
              className="form-input"
              placeholder="wss://rpc.example.com"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              required
              disabled={isConnecting}
            />
            <small className="form-help">
              Enter a WebSocket RPC endpoint (wss:// recommended)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="customName">Custom Name (Optional)</label>
            <input
              id="customName"
              type="text"
              className="form-input"
              placeholder="My Custom Chain"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={isConnecting}
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isConnecting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Add Chain'}
            </button>
          </div>
        </form>

        <div className="modal-footer">
          <h4>Popular Endpoints</h4>
          <div className="endpoint-examples">
            <code>wss://rpc.polkadot.io</code>
            <code>wss://kusama-rpc.polkadot.io</code>
            <code>wss://westend-rpc.polkadot.io</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddChainModal;
```

### 4. Enhanced Chain Selector

Update the Navigation component to integrate with ChainManager:

```javascript
import ChainManager from '../services/ChainManager';
import { ChainStorage } from '../services/ChainStorage';

const Navigation = ({ currentChain, onChainSelect }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [customChains, setCustomChains] = useState([]);

  useEffect(() => {
    // Load saved chains on mount
    const savedChains = ChainStorage.getChains();
    setCustomChains(savedChains);
    
    // Attempt to reconnect to saved chains in background
    savedChains.forEach(async (chain) => {
      try {
        await ChainManager.addChain(chain.endpoint, chain.customName);
      } catch (error) {
        console.warn(`Failed to reconnect to ${chain.endpoint}:`, error);
      }
    });
  }, []);

  const handleAddChain = async (endpoint, customName) => {
    const chainData = await ChainManager.addChain(endpoint, customName);
    ChainStorage.saveChain(endpoint, customName);
    setCustomChains(ChainStorage.getChains());
    onChainSelect(endpoint);
  };

  // Rest of component...
};
```

## Implementation Steps

### Step 1: Install Additional Dependencies (if needed)

```bash
npm install react-modal
```

### Step 2: Create Service Layer

1. Create `src/services/` directory
2. Implement `ChainManager.js`
3. Implement `ChainStorage.js`

### Step 3: Update State Management

Modify `usePolkadotApi` hook to accept dynamic endpoint switching:

```javascript
export const usePolkadotApi = (initialEndpoint = 'wss://rpc.polkadot.io') => {
  const [endpoint, setEndpoint] = useState(initialEndpoint);
  // ... rest of the hook
  
  const switchChain = useCallback((newEndpoint) => {
    setEndpoint(newEndpoint);
  }, []);
  
  return { api, chainInfo, isConnected, isLoading, error, switchChain };
};
```

### Step 4: Add UI Components

1. Create `AddChainModal.js` component
2. Update `Navigation.js` to include "Add Chain" button
3. Create chain management panel component

### Step 5: Add Styling

Add CSS for modal, forms, and chain management UI:

```css
/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2E4C9A;
}
```

### Step 6: Testing

Test the implementation with various chains:

```javascript
// Test cases
const testChains = [
  'wss://rpc.polkadot.io',
  'wss://kusama-rpc.polkadot.io',
  'wss://westend-rpc.polkadot.io',
  'wss://rococo-rpc.polkadot.io'
];

testChains.forEach(async (endpoint) => {
  try {
    const chain = await ChainManager.addChain(endpoint);
    console.log('✓ Connected to:', chain.metadata.chainName);
  } catch (error) {
    console.error('✗ Failed:', endpoint, error);
  }
});
```

## Error Handling Patterns

### Connection Errors

```javascript
try {
  await ChainManager.addChain(endpoint);
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout
    showNotification('Connection timeout. Please check the endpoint.');
  } else if (error.message.includes('Invalid')) {
    // Handle validation error
    showNotification('Invalid endpoint format.');
  } else {
    // Generic error
    showNotification('Failed to connect. Please try again.');
  }
}
```

### Runtime Upgrade Detection

```javascript
api.rpc.state.subscribeRuntimeVersion((version) => {
  console.log('Runtime upgraded to version:', version.specVersion.toNumber());
  // Refresh metadata
  ChainManager.retrieveChainMetadata(api);
});
```

## Security Checklist

- ✅ Validate all endpoint URLs before connection
- ✅ Warn users about insecure (ws://) connections
- ✅ Implement rate limiting on connection attempts
- ✅ Never store private keys in chain configurations
- ✅ Sanitize all displayed metadata
- ✅ Implement connection timeouts
- ✅ Use try-catch for all RPC calls
- ✅ Validate metadata structure before use

## Performance Optimization

### Connection Pooling

```javascript
class ConnectionPool {
  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections;
    this.active = new Map();
    this.inactive = new Map();
  }

  async acquire(endpoint) {
    // Reuse inactive connection if available
    if (this.inactive.has(endpoint)) {
      const conn = this.inactive.get(endpoint);
      this.inactive.delete(endpoint);
      this.active.set(endpoint, conn);
      return conn;
    }

    // Create new if under limit
    if (this.active.size < this.maxConnections) {
      const conn = await ChainManager.addChain(endpoint);
      this.active.set(endpoint, conn);
      return conn;
    }

    throw new Error('Connection pool exhausted');
  }

  release(endpoint) {
    if (this.active.has(endpoint)) {
      const conn = this.active.get(endpoint);
      this.active.delete(endpoint);
      this.inactive.set(endpoint, conn);
    }
  }
}
```

### Metadata Caching

```javascript
const metadataCache = new Map();

async function getCachedMetadata(api, genesisHash) {
  const cacheKey = `${genesisHash}-${api.runtimeVersion.specVersion}`;
  
  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey);
  }

  const metadata = await api.rpc.state.getMetadata();
  metadataCache.set(cacheKey, metadata);
  return metadata;
}
```

## Future Enhancements

1. **Endpoint Health Monitoring**: Track uptime, response times, and reliability
2. **Automatic Failover**: Switch to backup endpoints if primary fails
3. **Chain Discovery Protocol**: Auto-discover endpoints for known chains
4. **Custom Type Definitions**: Support chains with non-standard types
5. **Transaction Builder**: Generate forms from metadata for any chain
6. **Cross-Chain Analytics**: Compare metrics across multiple chains
7. **API Key Management**: Support for rate-limited or authenticated endpoints

## Resources

- [Polkadot.js API Documentation](https://polkadot.js.org/docs/api/)
- [Substrate RPC Methods](https://polkadot.js.org/docs/substrate/rpc)
- [Chain Metadata Specification](https://docs.substrate.io/reference/scale-codec/)

---

This guide provides the foundation for implementing full dynamic chain integration in BeaconBlock, enabling users to monitor any Substrate chain without code changes.
