// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import { debugPanelExpansionState } from '../../../recoilModel';

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
// TODOs:
// 1. Unify icon for errors / warnings accross whole Composer (use the filled version)
// 2. Styles - background color, font size...
// 3. Diagnostics tab filter (Errors, Warnings) https://www.figma.com/file/deFhMPBnRWxTYiYDYqYxrc/Composer-Vivek?node-id=10908%3A59195
// 4. Red dot on 'issues'
// 5. When there is no error, show a green 'ok' icon in status bar and display 'No error'
export interface DebugPanelProps {
  expanded: boolean;
  onToggleExpansion: (expanded: boolean) => void;
}
export const DebugPanel = () => {
  const [expanded, setExpansion] = useRecoilState(debugPanelExpansionState);

  const [activeTab, setActiveTab] = useState<string>(debugExtensions[0].key);

  const buildTabTitle = useCallback((tabKey: string, tabHeaderComponent: React.FC | string) => {
    if (!tabHeaderComponent) return { key: tabKey, element: null };

    let element: JSX.Element;
    if (typeof tabHeaderComponent === 'string') {
      element = <span key={`tabHeader-${tabKey}`}>{tabHeaderComponent}</span>;
    } else {
      const TabHeader = tabHeaderComponent;
      element = <TabHeader key={`tabHeader-${tabKey}`} />;
    }
    return { key: tabKey, element };
  }, []);

  const headerPivot = useMemo(() => {
    const tabTitles = debugExtensions
      .map(({ key, headerWidget }) => buildTabTitle(key, headerWidget))
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
        aria-label="Debug Panel Header"
        selectedKey={expanded ? activeTab : null}
        styles={{
          link: { height, lineHeight: height },
          linkIsSelected: { height, lineHeight: height },
        }}
      >
        {tabTitles}
      </Pivot>
    );
  }, [expanded, activeTab]);

  const activeTabContent = useMemo(() => {
    const configOfActiveTab = debugExtensions.find((ext) => ext.key === activeTab);
    if (!configOfActiveTab || !configOfActiveTab.contentWidget) return null;

    const TabContent = configOfActiveTab.contentWidget;
    return <TabContent key={`tabContent-${configOfActiveTab.key}`} />;
  }, [activeTab]);

  if (expanded) {
    return (
      <div
        css={css`
          ${debugPaneContainerExpandedStyle}
        `}
        data-testid="debug-panel--expanded"
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
              iconProps={{ iconName: 'Cancel' }}
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
        <div
          css={css`
            ${debugPaneBarStyle}
            ${statusBarStyle}
          `}
          data-testid="debug-panel__statusbar"
        >
          <div css={leftBarStyle} data-testid="statusbar__left"></div>
          <div css={rightBarStyle} data-testid="statusbar__right"></div>
        </div>
      </div>
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
        <div css={rightBarStyle} data-testid="statusbar__right"></div>
      </div>
    );
  }
};
