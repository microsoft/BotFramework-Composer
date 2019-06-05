import React, { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';

import { PanelSize } from '../../../shared/elementSizes';

export const Panel = ({ title, children, collapsedItems }) => {
  const [collapsed, setCollapsed] = useState(false);

  const collapseFuc = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      style={{
        border: '1px solid #656565',
        boxSizing: 'border-box',
        padding: '24px 0px 12px 24px',
        width: PanelSize.width,
        maxHeight: PanelSize.maxHeight,
        overflow: 'auto',
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
          style={{ transform: collapsed ? 'none' : 'rotate(90deg)', marginRight: '18px' }}
          onClick={collapseFuc}
        />
      </div>
      {collapsed ? <div>{collapsedItems}</div> : <div>{children}</div>}
    </div>
  );
};
