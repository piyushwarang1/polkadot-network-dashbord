import React, { useState, useEffect } from 'react';

const RecentBlocks = ({ api }) => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    if (!api) return;

    let unsubscribe = null;

    const subscribeToBlocks = async () => {
      try {
        unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
          const blockNumber = header.number.toNumber();
          const blockHash = header.hash.toHex();
          
          // Get block details
          const signedBlock = await api.rpc.chain.getBlock(blockHash);
          const extrinsicsCount = signedBlock.block.extrinsics.length;
          
          // Get validator/author
          const author = header.author?.toString() || 'Unknown';
          
          const newBlock = {
            number: blockNumber,
            hash: blockHash,
            extrinsics: extrinsicsCount,
            validator: author.substring(0, 8) + '...',
            time: new Date(),
            timestamp: Date.now()
          };

          setBlocks(prev => {
            const updated = [newBlock, ...prev].slice(0, 10);
            return updated;
          });
        });
      } catch (error) {
        console.error('Error subscribing to blocks:', error);
      }
    };

    subscribeToBlocks();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api]);

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  return (
    <div className="recent-blocks section-card">
      <div className="section-header">
        <h2>Recent Blocks</h2>
        <a href="#all-blocks" className="view-all">View All →</a>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Block Number</th>
              <th>Time</th>
              <th>Extrinsics</th>
              <th>Validator</th>
            </tr>
          </thead>
          <tbody>
            {blocks.length === 0 ? (
              <tr>
                <td colSpan="4" className="loading-row">Loading blocks...</td>
              </tr>
            ) : (
              blocks.map((block, index) => (
                <tr key={block.hash} className={index % 2 === 0 ? 'even-row' : ''}>
                  <td>
                    <a href={`#block/${block.number}`} className="block-link">
                      #{block.number.toLocaleString()}
                    </a>
                  </td>
                  <td className="time-cell">{getTimeAgo(block.timestamp)}</td>
                  <td>{block.extrinsics}</td>
                  <td>
                    <span className="validator-badge">{block.validator}</span>
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

export default RecentBlocks;
