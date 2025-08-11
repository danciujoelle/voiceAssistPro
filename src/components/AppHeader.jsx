import React from 'react';
import './AppHeader.css';

const AppHeader = () => {
  return (
    <div className="app-header">
      <img src="/voice_assist.png" alt="Voice Assist Pro" className="app-logo" />
      <h1 className="app-title">Voice Assist Pro</h1>
    </div>
  );
};

export default AppHeader;
