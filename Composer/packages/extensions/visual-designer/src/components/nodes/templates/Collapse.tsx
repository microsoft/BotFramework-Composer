import React, { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';

export const Collapse = ({ text, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const collapseFuc = e => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };
  return (
    <div
      className="collapse"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1008px',
        minWidth: '432px',
        margin: '0 auto',
      }}
    >
      <div
        className="collapse__topbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div
          className="collapse__header"
          style={{
            color: '#605E5C',
            fontSize: '12px',
            lineHeight: '19px',
            height: '22px',
            marginRight: '20px',
          }}
        >
          {text}
        </div>
        <div
          className="collapse__line"
          style={{
            flex: 1,
            border: '0.5px solid #000000',
            transform: 'rotate(0.01deg)',
          }}
        />
        <IconButton
          onClick={collapseFuc}
          iconProps={{ iconName: 'PageRight' }}
          style={{
            transform: collapsed ? 'rotate(270deg)' : 'rotate(90deg)',
            marginLeft: '12px',
            transition: 'transform 0.2s linear',
          }}
        />
      </div>
      <div className="collapse__content" style={{ display: collapsed ? 'none' : 'block' }}>
        {children}
      </div>
    </div>
  );
};
