// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useLayoutEffect } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { PanelSize } from '../../constants/ElementSizes';

export const Panel = ({ title, children, collapsedItems, addMenu, onClickContent }) => {
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

    PanelWidthList.forEach((panelWidth) => {
      const query = panelWidth.condition;
      if (query.matches) {
        setWidth(panelWidth.length);
      }
      panelWidth.condition.addListener((e) => {
        if (e.matches) {
          setWidth(panelWidth.length);
        }
      });
    });

    return () => {
      PanelWidthList.forEach((panelWidth) => {
        panelWidth.condition.removeListener((e) => {
          if (e.matches) {
            setWidth(panelWidth.length);
          }
        });
      });
    };
  });
  return (
    <div css={{ width: '100%' }}>
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: width,
          margin: '0 auto',
          minWidth: PanelSize.minWidth,
          maxWidth: PanelSize.maxWidth,
        }}
      >
        <div
          css={{
            flex: 1,
            color: '#656565',
            fontSize: '12px',
            lineHeight: '19px',
            height: '22px',
          }}
        >
          {title}
        </div>
        <IconButton
          css={{
            transform: collapsed ? 'rotate(270deg)' : 'rotate(90deg)',
            marginRight: '-15px',
            transition: 'transform 0.2s linear',
          }}
          iconProps={{ iconName: 'PageRight' }}
          onClick={collapseFuc}
        />
      </div>
      <div
        css={{
          border: '1px solid #656565',
          boxSizing: 'border-box',
          padding: '24px 0px 12px 24px',
          width: width,
          minWidth: PanelSize.minWidth,
          overflow: 'auto',
          margin: '0 auto',
          position: 'relative',
        }}
        onClick={onClickContent}
      >
        {collapsed ? <div>{collapsedItems}</div> : <div>{children}</div>}
        <div>{addMenu}</div>
      </div>
    </div>
  );
};
