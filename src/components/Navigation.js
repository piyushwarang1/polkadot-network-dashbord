import React, { useState } from 'react';

const Navigation = ({ chainInfo, onChainSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showChainDropdown, setShowChainDropdown] = useState(false);

  const chains = [
    { name: 'Polkadot', endpoint: 'wss://rpc.polkadot.io', icon: '🔵' },
    { name: 'Kusama', endpoint: 'wss://kusama-rpc.polkadot.io', icon: '🟡' },
    { name: 'Westend', endpoint: 'wss://westend-rpc.polkadot.io', icon: '🟣' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-left">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">BeaconBlock</span>
          </div>
        </div>

        <div className="nav-center">
          <div className="chain-selector" onClick={() => setShowChainDropdown(!showChainDropdown)}>
            <span className="chain-icon">{chainInfo?.chainName?.includes('Kusama') ? '🟡' : '🔵'}</span>
            <span className="chain-name">{chainInfo?.chainName || 'Loading...'}</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          {showChainDropdown && (
            <div className="chain-dropdown">
              {chains.map((chain) => (
                <div
                  key={chain.endpoint}
                  className="chain-option"
                  onClick={() => {
                    onChainSelect && onChainSelect(chain.endpoint);
                    setShowChainDropdown(false);
                  }}
                >
                  <span className="chain-icon">{chain.icon}</span>
                  <span>{chain.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-right">
          <div className="nav-links">
            <a href="#blockchain" className="nav-link">Blockchain</a>
            <a href="#validators" className="nav-link">Validators</a>
            <a href="#analytics" className="nav-link">Analytics</a>
            <a href="#api" className="nav-link">API</a>
          </div>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Search by Block / Extrinsic / Account"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
