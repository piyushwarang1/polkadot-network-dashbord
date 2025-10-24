import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

export const usePolkadotApi = (customEndpoint = null) => {
  const [api, setApi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chainInfo, setChainInfo] = useState(null);

  useEffect(() => {
    let apiInstance = null;
    let wsProvider = null;

    const connectToChain = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Default to Polkadot mainnet
        const endpoint = customEndpoint || 'wss://rpc.polkadot.io';
        
        wsProvider = new WsProvider(endpoint);
        apiInstance = await ApiPromise.create({ provider: wsProvider });

        // Retrieve chain information
        const [chain, nodeName, nodeVersion, properties, genesisHash, runtimeVersion] = await Promise.all([
          apiInstance.rpc.system.chain(),
          apiInstance.rpc.system.name(),
          apiInstance.rpc.system.version(),
          apiInstance.rpc.system.properties(),
          apiInstance.genesisHash,
          apiInstance.runtimeVersion
        ]);

        const info = {
          chainName: chain.toString(),
          nodeName: nodeName.toString(),
          nodeVersion: nodeVersion.toString(),
          tokenSymbol: properties.tokenSymbol?.toString() || 'DOT',
          tokenDecimals: properties.tokenDecimals?.toJSON()?.[0] || 10,
          ss58Format: properties.ss58Format?.toJSON() || 0,
          genesisHash: genesisHash.toHex(),
          runtimeVersion: runtimeVersion.specVersion.toNumber(),
          specName: runtimeVersion.specName.toString(),
          endpoint
        };

        setChainInfo(info);
        setApi(apiInstance);
        setIsConnected(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to connect to chain:', err);
        setError(err.message || 'Failed to connect to the blockchain network');
        setIsLoading(false);
        setIsConnected(false);
      }
    };

    connectToChain();

    return () => {
      if (apiInstance) {
        apiInstance.disconnect();
      }
    };
  }, [customEndpoint]);

  return { api, isConnected, isLoading, error, chainInfo };
};
