import React, { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';

const PanelWidth = 660;

export const Panel = ({ title, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const collapseFuc = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      style={{
        border: '1px solid #656565',
        boxSizing: 'border-box',
        padding: collapsed ? '6px 0' : '15px 0 6px',
        width: PanelWidth,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          marginBottom: '12px',
          alignItems: 'center',
        }}
      >
        <div style={{ width: 'calc(100% - 30px)' }}>{title}</div>
        <IconButton
          iconProps={{ iconName: 'PageRight' }}
          style={{ transform: collapsed ? 'none' : 'rotate(90deg)' }}
          onClick={collapseFuc}
        />
      </div>
      {collapsed ? <div style={{ height: 10, overflow: 'hidden' }}>{children}</div> : <div>{children}</div>}
    </div>
  );
};
