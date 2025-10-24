import React, { useState, useEffect } from 'react';

const RecentExtrinsics = ({ api }) => {
  const [extrinsics, setExtrinsics] = useState([]);

  useEffect(() => {
    if (!api) return;

    let unsubscribe = null;

    const subscribeToExtrinsics = async () => {
      try {
        unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
          const blockNumber = header.number.toNumber();
          const blockHash = header.hash.toHex();
          
          // Get block details
          const signedBlock = await api.rpc.chain.getBlock(blockHash);
          const blockExtrinsics = signedBlock.block.extrinsics;

          // Process extrinsics
          const newExtrinsics = blockExtrinsics.slice(0, 3).map((ext, index) => {
            const method = ext.method;
            const section = method.section;
            const methodName = method.method;
            
            return {
              id: `${blockNumber}-${index}`,
              block: blockNumber,
              hash: ext.hash.toHex(),
              action: `${section}.${methodName}`,
              success: Math.random() > 0.1, // Mock success rate
              time: Date.now(),
              timestamp: Date.now()
            };
          });

          setExtrinsics(prev => {
            const updated = [...newExtrinsics, ...prev].slice(0, 10);
            return updated;
          });
        });
      } catch (error) {
        console.error('Error subscribing to extrinsics:', error);
      }
    };

    subscribeToExtrinsics();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api]);

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const truncateHash = (hash) => {
    return hash.substring(0, 10) + '...' + hash.substring(hash.length - 8);
  };

  return (
    <div className="recent-extrinsics section-card">
      <div className="section-header">
        <h2>Recent Extrinsics</h2>
        <a href="#all-extrinsics" className="view-all">View All →</a>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Extrinsic ID</th>
              <th>Block</th>
              <th>Time</th>
              <th>Action</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {extrinsics.length === 0 ? (
              <tr>
                <td colSpan="5" className="loading-row">Loading extrinsics...</td>
              </tr>
            ) : (
              extrinsics.map((ext, index) => (
                <tr key={ext.id} className={index % 2 === 0 ? 'even-row' : ''}>
                  <td>
                    <a href={`#extrinsic/${ext.hash}`} className="extrinsic-link">
                      {truncateHash(ext.hash)}
                    </a>
                  </td>
                  <td>
                    <a href={`#block/${ext.block}`} className="block-link">
                      #{ext.block.toLocaleString()}
                    </a>
                  </td>
                  <td className="time-cell">{getTimeAgo(ext.timestamp)}</td>
                  <td className="action-cell">{ext.action}</td>
                  <td>
                    <span className={`status-badge ${ext.success ? 'success' : 'failed'}`}>
                      {ext.success ? '✓ Success' : '✗ Failed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentExtrinsics;
