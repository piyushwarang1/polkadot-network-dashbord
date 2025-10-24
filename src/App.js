import React from 'react';
import './App.css';
import { usePolkadotApi } from './hooks/usePolkadotApi';
import Navigation from './components/Navigation';
import HeroStats from './components/HeroStats';
import RecentBlocks from './components/RecentBlocks';
import RecentExtrinsics from './components/RecentExtrinsics';
import NetworkStatus from './components/NetworkStatus';
import ChainInformation from './components/ChainInformation';
import QuickStats from './components/QuickStats';

function App() {
  const { api, isConnected, isLoading, error, chainInfo } = usePolkadotApi();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>🔗 Connecting to Polkadot Network...</h2>
        <p>This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-icon">❌</div>
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="loading-screen">
        <h2>⏳ Connecting...</h2>
      </div>
    );
  }

  return (
    <div className="App">
      <Navigation chainInfo={chainInfo} />
      
      <div className="page-background">
        <div className="container">
          {/* Hero Stats Section */}
          <section className="hero-section">
            <HeroStats api={api} />
          </section>

          {/* Main Content Grid */}
          <div className="main-grid">
            {/* Left Column */}
            <div className="main-content">
              <RecentBlocks api={api} />
              <RecentExtrinsics api={api} />
            </div>

            {/* Right Sidebar */}
            <aside className="sidebar">
              <NetworkStatus />
              <ChainInformation chainInfo={chainInfo} />
              <QuickStats api={api} />
            </aside>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>BeaconBlock</h4>
              <p>Universal Substrate Blockchain Explorer</p>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#api">API</a>
              <a href="#support">Support</a>
            </div>
            <div className="footer-section">
              <h4>Community</h4>
              <a href="#github">GitHub</a>
              <a href="#discord">Discord</a>
              <a href="#twitter">Twitter</a>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 BeaconBlock. Built for the Substrate Ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
