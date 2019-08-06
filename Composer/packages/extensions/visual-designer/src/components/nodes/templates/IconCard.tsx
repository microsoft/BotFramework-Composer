import React from 'react';
import { Icon as FabricIcon } from 'office-ui-fabric-react';

import { Icon } from '../icons/icon';

const boxWidth = 240;
const boxHeight = 120;

const headerHeight = 40;
const contentHeight = boxHeight - headerHeight;

export const IconCard = ({
  corner,
  label,
  trigger,
  summary,
  childDialog,
  icon,
  themeColor,
  iconColor,
  onClick,
  onChildDialogClick,
}) => {
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

  return (
    <div
      className="card"
      data-testid="IconCard"
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
          {label}
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
            padding: '5px 10px',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'top',
          }}
        >
          <div style={{ width: 20, height: 20, marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            <Icon icon={icon} color={iconColor} size={20} />
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
            {trigger}
          </div>
        </div>
        <div
          style={{
            fontWeight: 400,
            padding: '5px 10px',
            borderTop: '1px solid #EBEBEB',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'top',
          }}
        >
          <div style={{ width: 20, height: 20, marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            <Icon icon="MessageBot" color="#656565" size={20} />
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
            {summary && <div>{summary}</div>}
            {childDialog && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FabricIcon
                  style={{ lineHeight: '16px', fontSize: '16px' }}
                  iconName="OpenSource"
                  onClick={e => {
                    e.stopPropagation();
                    onChildDialogClick();
                  }}
                />
                <span
                  data-testid="OpenIcon"
                  style={{
                    cursor: 'pointer',
                    color: 'blue',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    onChildDialogClick();
                  }}
                >
                  {childDialog}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

IconCard.defaultProps = {
  onClick: () => {},
};
