import React from 'react';

const containerStyle = {
  width: 150,
  height: 95,
  fontSize: '20px',
  cursor: 'pointer',
  overflow: 'hidden',
  backgroundColor: 'white',
  borderRadius: '2px',
  boxShadow: '0px 1.2px 3.6px rgba(0, 0, 0, 0.108), 0px 6.4px 14.4px rgba(0, 0, 0, 0.132)',
};

export const FormCard = ({ header, label, details, themeColor, onClick }) => (
  <div className="card" style={containerStyle} onClick={onClick}>
    <div
      className="card__header"
      style={{
        width: '100%',
        height: 24,
        backgroundColor: themeColor,
        color: '#ffffff',
        fontWeight: '700',
        paddingLeft: '8px',
        paddingBottom: '8px',
      }}
    >
      {header}
    </div>
    <div
      className="card__content"
      style={{
        width: '100%',
        height: 71,
      }}
    >
      <div style={{ fontWeight: '400', paddingLeft: '5px', marginTop: '5px' }}>{label}</div>
      <div style={{ fontWeight: '300', paddingLeft: '5px', marginTop: '5px' }}>{details}</div>
    </div>
  </div>
);
