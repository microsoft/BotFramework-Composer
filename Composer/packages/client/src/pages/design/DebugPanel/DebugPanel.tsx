// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { FontSizes } from '@uifabric/fluent-theme';

import { debugPanelExpansionState, debugPanelActiveTabState } from '../../../recoilModel';

import {
  debugPaneContainerExpandedStyle,
  debugPaneBarStyle,
  leftBarStyle,
  rightBarStyle,
  debugPaneHeaderStyle,
  statusBarStyle,
  debugPaneContentStyle,
} from './styles';
import debugExtensions from './TabExtensions';
import { Resizable } from 're-resizable';

export interface DebugPanelProps {
  expanded: boolean;
  onToggleExpansion: (expanded: boolean) => void;
}
export const DebugPanel = () => {
  const [expanded, setExpansion] = useRecoilState(debugPanelExpansionState);
  const [activeTab, setActiveTab] = useRecoilState(debugPanelActiveTabState);

  const buildTabTitle = useCallback((tabKey: string, TabHeaderWidget: React.FC | string) => {
    if (!TabHeaderWidget) return { key: tabKey, element: null };

    let element: JSX.Element;
    if (typeof TabHeaderWidget === 'string') {
      element = <span key={`tabHeader-${tabKey}`}>{TabHeaderWidget}</span>;
    } else {
      element = <TabHeaderWidget key={`tabHeader-${tabKey}`} />;
    }
    return { key: tabKey, element };
  }, []);

  const headerPivot = useMemo(() => {
    const tabTitles = debugExtensions
      .map(({ key, HeaderWidget }) => buildTabTitle(key, HeaderWidget))
      .filter(({ element }) => Boolean(element))
      .map(({ key, element }) => {
        return (
          <PivotItem
            key={`tabHeader-pivot-${key}${expanded ? '--expanded' : ''}`}
            itemKey={key}
            onRenderItemLink={() => (
              <div
                css={{ height: 'inherit', width: 'inherit' }}
                onClick={() => {
                  setActiveTab(key);
                  setExpansion(true);
                }}
              >
                {element}
              </div>
            )}
          />
        );
      });
    const height = expanded ? 36 : 24;
    return (
      <Pivot
        aria-label={formatMessage('Debug Panel Header')}
        selectedKey={expanded ? activeTab : null}
        styles={{
          link: { height, lineHeight: height, fontSize: FontSizes.size12 },
          linkIsSelected: { height, lineHeight: height, fontSize: FontSizes.size12 },
        }}
      >
        {tabTitles}
      </Pivot>
    );
  }, [expanded, activeTab]);

  const activeTabContent = useMemo(() => {
    const configOfActiveTab = debugExtensions.find((ext) => ext.key === activeTab);
    if (!configOfActiveTab || !configOfActiveTab.ContentWidget) return null;

    const { ContentWidget } = configOfActiveTab;
    return <ContentWidget key={`tabContent-${configOfActiveTab.key}`} />;
  }, [activeTab]);

  if (expanded) {
    return (
      <Resizable
        css={css`
          ${debugPaneContainerExpandedStyle}
        `}
        data-testid="debug-panel--expanded"
        defaultSize={{
          width: '100%',
          height: 300,
        }}
        minHeight="200"
        maxHeight="600"
        enable={{
          top: true,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <div
          css={css`
            ${debugPaneBarStyle}
            ${debugPaneHeaderStyle}
          `}
          data-testid="debug-panel__header"
        >
          <div css={leftBarStyle} data-testid="header__left">
            {headerPivot}
          </div>
          <div css={rightBarStyle} data-testid="header__right">
            <IconButton
              iconProps={{ iconName: 'ChevronDown' }}
              title={formatMessage('Collapse debug panel')}
              onClick={() => {
                setExpansion(!expanded);
              }}
            />
          </div>
        </div>
        <div css={debugPaneContentStyle} data-testid="debug-panel__content">
          {activeTabContent}
        </div>
      </Resizable>
    );
  } else {
    return (
      <div
        css={css`
          ${debugPaneBarStyle}
          ${statusBarStyle}
        `}
        data-testid="debug-panel__statusbar"
      >
        <div css={leftBarStyle} data-testid="statusbar__left">
          {headerPivot}
        </div>
        <div css={rightBarStyle} data-testid="statusbar__right">
          <IconButton
            iconProps={{ iconName: 'ChevronUp' }}
            title={formatMessage('Expand debug panel')}
            onClick={() => {
              setExpansion(true);
            }}
          />
        </div>
      </div>
    );
  }
};
