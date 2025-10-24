import React from 'react';

const NetworkStatus = () => {
  const subsystems = [
    { name: 'Block Production', status: 'operational' },
    { name: 'Finalization', status: 'operational' },
    { name: 'RPC Nodes', status: 'operational' },
    { name: 'Network Sync', status: 'operational' }
  ];

  return (
    <div className="network-status sidebar-card">
      <h3 className="sidebar-title">Network Status</h3>
      <div className="status-indicator">
        <div className="status-icon success">✓</div>
        <div className="status-text">All Systems Operational</div>
      </div>
      <div className="subsystems-list">
        {subsystems.map((system, index) => (
          <div key={index} className="subsystem-item">
            <span className={`status-dot ${system.status}`}></span>
            <span className="subsystem-name">{system.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkStatus;
