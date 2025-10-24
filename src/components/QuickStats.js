import React, { useState, useEffect } from 'react';

const QuickStats = ({ api }) => {
  const [stats, setStats] = useState({
    finalizedBlocks: 0,
    peers: 0,
    uptime: '99.9%',
    avgBlockTime: '6.0s'
  });

  useEffect(() => {
    if (!api) return;

    const fetchStats = async () => {
      try {
        const [finalizedHead, health] = await Promise.all([
          api.rpc.chain.getFinalizedHead(),
          api.rpc.system.health()
        ]);

        const finalizedHeader = await api.rpc.chain.getHeader(finalizedHead);
        
        setStats({
          finalizedBlocks: finalizedHeader.number.toNumber(),
          peers: health.peers.toNumber(),
          uptime: '99.9%',
          avgBlockTime: '6.0s'
        });
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, [api]);

  const quickStats = [
    { label: 'Finalized Blocks', value: stats.finalizedBlocks.toLocaleString(), icon: '🔒' },
    { label: 'Connected Peers', value: stats.peers, icon: '🌐' },
    { label: 'Network Uptime', value: stats.uptime, icon: '⏰' },
    { label: 'Avg Block Time', value: stats.avgBlockTime, icon: '⚡' }
  ];

  return (
    <div className="quick-stats sidebar-card">
      <h3 className="sidebar-title">Quick Stats</h3>
      <div className="mini-cards">
        {quickStats.map((stat, index) => (
          <div key={index} className="mini-card">
            <div className="mini-icon">{stat.icon}</div>
            <div className="mini-content">
              <div className="mini-label">{stat.label}</div>
              <div className="mini-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;
