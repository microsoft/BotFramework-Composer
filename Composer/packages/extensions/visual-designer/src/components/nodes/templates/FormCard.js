import React from 'react';

import { Icon } from '../icons/icon';
import { ElementWidth, ElementHeight, HeaderHeight } from '../../shared/NodeMeta';

const boxWidth = ElementWidth;
const boxHeight = ElementHeight;
const headerHeight = HeaderHeight;
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

export const FormCard = ({ header, corner, label, details, icon, themeColor, onClick }) => (
  <div
    className="card"
    style={containerStyle}
    onClick={e => {
      e.stopPropagation();
      onClick();
    }}
  >
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
        paddingTop: '5px',
        boxSizing: 'border-box',
      }}
    >
      <span>{header}</span>
      <div style={{ position: 'absolute', top: 8, right: 0 }}>{corner}</div>
    </div>
    <div
      className="card__content"
      style={{
        width: '100%',
        height: contentHeight,
      }}
    >
      <div
        style={{
          fontWeight: '400',
          paddingLeft: '5px',
          marginTop: '6px',
          fontSize: '14px',
          lineHeight: '19px',
          display: 'flex',
        }}
      >
        <Icon icon={icon || 'MessageBot'} color={themeColor} />
        <div
          style={{
            height: '100%',
            width: 'calc(100% - 20px)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
          title={typeof label === 'string' ? label : ''}
        >
          {label}
        </div>
      </div>
      <div style={{ fontWeight: '300', paddingLeft: '5px', marginTop: '5px', fontSize: '12px' }}>{details}</div>
    </div>
  </div>
);
