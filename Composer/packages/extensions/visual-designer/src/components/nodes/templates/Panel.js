import React, { useState, useLayoutEffect } from 'react';
import { IconButton } from 'office-ui-fabric-react';

import { PanelSize } from '../../../shared/elementSizes';

export const Panel = ({ title, children, collapsedItems }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(PanelSize.defaultWidth);

  const collapseFuc = () => {
    setCollapsed(!collapsed);
  };

  useLayoutEffect(() => {
    const PanelWidthList = [
      { condition: window.matchMedia('(min-width: 1051px)'), length: PanelSize.maxWidth },
      { condition: window.matchMedia('(max-width: 1050px) and (min-width: 852px)'), length: 824 },
      { condition: window.matchMedia('(max-width: 851px) and (min-width: 680px)'), length: 624 },
      { condition: window.matchMedia('(max-width: 679px)'), length: PanelSize.minWidth },
    ];

    PanelWidthList.forEach(panelWidth => {
      const query = panelWidth.condition;
      if (query.matches) {
        setWidth(panelWidth.length);
      }
      panelWidth.condition.addListener(e => {
        if (e.matches) {
          setWidth(panelWidth.length);
        }
      });
    });

    return () => {
      PanelWidthList.forEach(panelWidth => {
        panelWidth.condition.removeListener(e => {
          if (e.matches) {
            setWidth(panelWidth.length);
          }
        });
      });
    };
  });
  return (
    <div
      style={{
        border: '1px solid #656565',
        boxSizing: 'border-box',
        padding: '24px 0px 12px 24px',
        maxHeight: PanelSize.maxHeight,
        width: width,
        minWidth: PanelSize.minWidth,
        maxWidth: PanelSize.maxWidth,
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
