import React, { useState, useEffect } from 'react';

const HeroStats = ({ api }) => {
  const [stats, setStats] = useState({
    latestBlock: 0,
    blockTime: '6.0s',
    activeValidators: 0,
    totalTransactions: 0,
    networkHealth: '99.9%'
  });

  useEffect(() => {
    if (!api) return;

    let unsubscribe = null;

    const subscribeToBlocks = async () => {
      try {
        // Subscribe to new block headers
        unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
          setStats(prev => ({
            ...prev,
            latestBlock: header.number.toNumber()
          }));
        });

        // Get validator count
        const validators = await api.query.session?.validators();
        if (validators) {
          setStats(prev => ({
            ...prev,
            activeValidators: validators.length
          }));
        }

        // Get total issuance (as proxy for network activity)
        const totalIssuance = await api.query.balances?.totalIssuance();
        if (totalIssuance) {
          setStats(prev => ({
            ...prev,
            totalTransactions: Math.floor(Math.random() * 1000000) + 5000000 // Mock data
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    subscribeToBlocks();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api]);

  const statCards = [
    {
      label: 'Latest Block',
      value: stats.latestBlock.toLocaleString(),
      icon: '📦',
      iconBg: '#4F46E5',
      change: '+0.2%'
    },
    {
      label: 'Block Time',
      value: stats.blockTime,
      icon: '⏱️',
      iconBg: '#06B6D4',
      change: '-1.5%'
    },
    {
      label: 'Active Validators',
      value: stats.activeValidators.toLocaleString(),
      icon: '👥',
      iconBg: '#10B981',
      change: '+2.1%'
    },
    {
      label: 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      icon: '📊',
      iconBg: '#F59E0B',
      change: '+12.3%'
    },
    {
      label: 'Network Health',
      value: stats.networkHealth,
      icon: '💚',
      iconBg: '#00D092',
      change: '100%'
    }
  ];

  return (
    <div className="hero-stats">
      {statCards.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: stat.iconBg }}>
            {stat.icon}
          </div>
          <div className="stat-content">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change positive">
              <span className="change-arrow">↗</span>
              <span>{stat.change} 24h</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroStats;
