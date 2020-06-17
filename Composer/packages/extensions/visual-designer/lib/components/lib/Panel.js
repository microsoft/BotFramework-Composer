// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useLayoutEffect } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { PanelSize } from '../../constants/ElementSizes';
export var Panel = function (_a) {
  var title = _a.title,
    children = _a.children,
    collapsedItems = _a.collapsedItems,
    addMenu = _a.addMenu,
    onClickContent = _a.onClickContent;
  var _b = useState(false),
    collapsed = _b[0],
    setCollapsed = _b[1];
  var _c = useState(PanelSize.defaultWidth),
    width = _c[0],
    setWidth = _c[1];
  var collapseFuc = function () {
    setCollapsed(!collapsed);
  };
  useLayoutEffect(function () {
    var PanelWidthList = [
      { condition: window.matchMedia('(min-width: 1051px)'), length: PanelSize.maxWidth },
      { condition: window.matchMedia('(max-width: 1050px) and (min-width: 852px)'), length: 824 },
      { condition: window.matchMedia('(max-width: 851px) and (min-width: 680px)'), length: 624 },
      { condition: window.matchMedia('(max-width: 679px)'), length: PanelSize.minWidth },
    ];
    PanelWidthList.forEach(function (panelWidth) {
      var query = panelWidth.condition;
      if (query.matches) {
        setWidth(panelWidth.length);
      }
      panelWidth.condition.addListener(function (e) {
        if (e.matches) {
          setWidth(panelWidth.length);
        }
      });
    });
    return function () {
      PanelWidthList.forEach(function (panelWidth) {
        panelWidth.condition.removeListener(function (e) {
          if (e.matches) {
            setWidth(panelWidth.length);
          }
        });
      });
    };
  });
  return jsx(
    'div',
    { css: { width: '100%' } },
    jsx(
      'div',
      {
        css: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: width,
          margin: '0 auto',
          minWidth: PanelSize.minWidth,
          maxWidth: PanelSize.maxWidth,
        },
      },
      jsx(
        'div',
        {
          css: {
            flex: 1,
            color: '#656565',
            fontSize: '12px',
            lineHeight: '19px',
            height: '22px',
          },
        },
        title
      ),
      jsx(IconButton, {
        css: {
          transform: collapsed ? 'rotate(270deg)' : 'rotate(90deg)',
          marginRight: '-15px',
          transition: 'transform 0.2s linear',
        },
        iconProps: { iconName: 'PageRight' },
        onClick: collapseFuc,
      })
    ),
    jsx(
      'div',
      {
        css: {
          border: '1px solid #656565',
          boxSizing: 'border-box',
          padding: '24px 0px 12px 24px',
          width: width,
          minWidth: PanelSize.minWidth,
          overflow: 'auto',
          margin: '0 auto',
          position: 'relative',
        },
        onClick: onClickContent,
      },
      collapsed ? jsx('div', null, collapsedItems) : jsx('div', null, children),
      jsx('div', null, addMenu)
    )
  );
};
//# sourceMappingURL=Panel.js.map
