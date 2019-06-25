import React from 'react';

import { Icon } from '../icons/icon';
import { InitNodeSize } from '../../../shared/elementSizes';

const boxWidth = InitNodeSize.width;
const boxHeight = InitNodeSize.height;
const headerHeight = 40;
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

export const FormCard = ({ header, corner, label, icon = 'MessageBot', nodeColors, onClick }) => {
  const { themeColor, iconColor } = nodeColors;
  return (
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
          color: 'black',
          position: 'relative',
        }}
      >
        <div style={{ padding: '10px 10px', fontSize: '14px', fontFamily: 'Segoe UI', lineHeight: '19px' }}>
          {header}
        </div>
        <div style={{ position: 'absolute', top: 10, right: 0 }}>{corner}</div>
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
            fontWeight: 400,
            paddingLeft: '10px',
            margin: '5px',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center' }}>
            <Icon icon={icon} color={iconColor} size={30} />
          </div>
          <div
            style={{
              height: '100%',
              width: 'calc(100% - 20px)',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontSize: '14px',
              lineHeight: '19px',
              fontFamily: 'Segoe UI',
            }}
            title={typeof label === 'string' ? label : ''}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};
