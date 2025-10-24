import React from 'react';

const ChainInformation = ({ chainInfo }) => {
  const info = [
    { label: 'Chain Name', value: chainInfo?.chainName || 'Loading...' },
    { label: 'Token Symbol', value: chainInfo?.tokenSymbol || '-' },
    { label: 'Decimals', value: chainInfo?.tokenDecimals || '-' },
    { label: 'Runtime Version', value: chainInfo?.runtimeVersion || '-' },
    { label: 'Spec Name', value: chainInfo?.specName || '-' },
    { label: 'SS58 Format', value: chainInfo?.ss58Format || '-' }
  ];

  return (
    <div className="chain-information sidebar-card">
      <h3 className="sidebar-title">Chain Information</h3>
      <div className="info-list">
        {info.map((item, index) => (
          <div key={index} className="info-item">
            <span className="info-label">{item.label}</span>
            <span className="info-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChainInformation;
