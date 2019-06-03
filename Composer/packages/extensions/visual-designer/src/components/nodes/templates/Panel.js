import React, { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';

const PanelWidth = 660;

export const Panel = ({ text, count, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const collapseFuc = () => {
    setCollapsed(!collapsed);
  };

  const _onRenderCollapseItem = ({ count }) => {
    const items = [];

    for (let i = 0; i < count; i++) {
      if (i < 3) {
        items.push(
          <div
            key={i}
            style={{ width: '180px', height: '4px', background: ' #00B7C3', marginRight: i < 2 ? '12px' : '0' }}
          />
        );
      } else {
        break;
      }
    }
    return <div style={{ margin: '0 40px', display: 'flex' }}>{items}</div>;
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
        <IconButton iconProps={{ iconName: 'CircleAddition' }} style={{ color: '#0078D4' }} />
        <div
          style={{
            flex: 1,
            color: '#605E5C',
            fontSize: '12px',
            lineHeight: '19px',
            height: '22px',
          }}
        >
          {text}({count})
        </div>
        <IconButton
          iconProps={{
            iconName: 'ErrorBadge',
          }}
          style={{ position: 'absolute', top: 6, right: 24 }}
        />
        <IconButton
          iconProps={{ iconName: 'PageRight' }}
          style={{ transform: collapsed ? 'none' : 'rotate(90deg)', position: 'absolute', top: 6, right: 0 }}
          onClick={collapseFuc}
        />
      </div>
      {collapsed ? _onRenderCollapseItem({ count }) : <div>{children}</div>}
    </div>
  );
};
