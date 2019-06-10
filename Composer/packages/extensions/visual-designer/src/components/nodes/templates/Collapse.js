import React, { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';

const Width = 660;

export const Collapse = ({ text, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const collapseFuc = e => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: Width,
        }}
      >
        <div
          style={{
            flex: 1,
            color: '#605E5C',
            fontSize: '12px',
            lineHeight: '19px',
            height: '22px',
            borderBottom: '1px solid #000000',
          }}
        >
          {text}
        </div>
        <IconButton
          onClick={collapseFuc}
          iconProps={{ iconName: 'PageRight' }}
          style={{ transform: collapsed ? 'none' : 'rotate(90deg)' }}
        />
      </div>
      <div style={{ display: collapsed ? 'none' : 'block' }}>{children}</div>
    </div>
  );
};
