import React from 'react';

const boxWidth = 170;
const boxHeight = 50;
const headerHeight = 24;
const contentHeight = boxHeight - headerHeight;

const containerStyle = {
  width: boxWidth,
  height: boxHeight,
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
        height: `${headerHeight}px`,
        backgroundColor: themeColor,
        fontFamily: 'Segoe UI',
        fontSize: '14px',
        lineHeight: '19px',
        color: '#ffffff',
        paddingLeft: '8px',
      }}
    >
      <span>{header}</span>
    </div>
    <div
      className="card__content"
      style={{
        width: '100%',
        height: contentHeight,
      }}
    >
      <div style={{ fontWeight: '400', paddingLeft: '5px', marginTop: '5px' }}>{label}</div>
      <div style={{ fontWeight: '300', paddingLeft: '5px', marginTop: '5px' }}>{details}</div>
    </div>
  </div>
);
