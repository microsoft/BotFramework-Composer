import React from 'react';

import { Icon } from '../icons/icon';

const boxWidth = 227;
const boxHeight = 36;

export const IconCard = ({ corner, label, icon, themeColor, onClick }) => {
  const containerStyle = {
    width: boxWidth,
    height: boxHeight,
    fontSize: '14px',
    lineHeight: '19px',
    cursor: 'pointer',
    overflow: 'hidden',
    backgroundColor: themeColor,
    color: 'white',
    borderRadius: '2px',
    boxShadow: '0px 1.2px 3.6px rgba(0, 0, 0, 0.108), 0px 6.4px 14.4px rgba(0, 0, 0, 0.132)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '10px',
  };
  return (
    <div
      style={containerStyle}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Icon icon={icon || 'MessageBot'} color={themeColor} />
      <div
        style={{
          lineHeight: '29px',
          width: 'calc(100% - 20px)',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
        title={typeof label === 'string' ? label : ''}
      >
        {label}
      </div>
      <div style={{ position: 'absolute', top: 9, right: 0 }}>{corner}</div>
    </div>
  );
};
