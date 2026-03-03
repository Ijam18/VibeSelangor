import React from 'react';

const DesktopIcon = ({ label, icon: Icon, onClick, color = '#f5d000', isPhoneMode = false, isTabletMode = false }) => (
  <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isPhoneMode ? '6px' : '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: isPhoneMode ? '8px 6px' : (isTabletMode ? '10px' : '12px'), borderRadius: '12px', transition: 'background 0.2s' }}>
    <div style={{ background: '#0b1220', border: `2px solid ${color}`, color, padding: isPhoneMode ? '10px' : '12px', borderRadius: '14px', boxShadow: '4px 4px 0 rgba(0,0,0,0.4)' }}>
      <Icon size={isPhoneMode ? 24 : 32} />
    </div>
    <span style={{ color: '#fff', fontSize: isPhoneMode ? '10px' : '11px', fontWeight: 800, fontFamily: 'monospace', textShadow: '1px 1px 4px #000' }}>{label}</span>
  </button>
);

export default DesktopIcon;
