// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { FontSizes } from '@uifabric/fluent-theme';
import { Resizable } from 're-resizable';
import { Label } from 'office-ui-fabric-react/lib/Label';

import TelemetryClient from '../../../telemetry/TelemetryClient';
import { debugPanelExpansionState, debugPanelActiveTabState } from '../../../recoilModel';

import {
  debugPaneContainerExpandedStyle,
  debugPaneBarStyle,
  leftBarStyle,
  rightBarStyle,
  debugPaneHeaderStyle,
  debugPaneContentStyle,
} from './styles';
import debugExtensions from './TabExtensions';
import { DebugDrawerKeys, DebugPanelTabHeaderProps } from './TabExtensions/types';

const defaultDebugPanelHeaderHeight = 36;

export const DebugPanel: React.FC = () => {
  const [isPanelExpanded, setPanelExpansion] = useRecoilState(debugPanelExpansionState);
  const [activeTab, setActiveTab] = useRecoilState(debugPanelActiveTabState);

  const buildTabTitle = useCallback(
    (tabKey: DebugDrawerKeys, TabHeaderWidget: React.FC<DebugPanelTabHeaderProps> | string) => {
      if (!TabHeaderWidget) return { key: tabKey, element: null };

      let element: JSX.Element;
      if (typeof TabHeaderWidget === 'string') {
        element = (
          <span key={`tabHeader-${tabKey}`}>
            <TabHeaderWidget />
          </span>
        );
      } else {
        element = <TabHeaderWidget key={`tabHeader-${tabKey}`} isActive={activeTab === tabKey} />;
      }
      return { key: tabKey, element };
    },
    [activeTab]
  );

  const headerPivot = useMemo(() => {
    const tabTitles = debugExtensions
      .map(({ key, HeaderWidget }) => buildTabTitle(key, HeaderWidget))
      .filter(({ element }) => Boolean(element))
      .map(({ key, element }) => {
        return (
          <PivotItem
            key={`tabHeader-pivot-${key}${isPanelExpanded ? '--expanded' : ''}`}
            itemKey={key}
            onRenderItemLink={() => (
              <Label
                css={{
                  height: 'inherit',
                  width: 'inherit',
                  outline: 'none',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  fontSize: FontSizes.size12,
                }}
                onClick={() => {
                  setActiveTab(key);
                  setPanelExpansion(true);
                  TelemetryClient.track('DrawerPaneTabOpened', {
                    tabType: key,
                  });
                  TelemetryClient.track('DrawerPaneOpened');
                }}
              >
                {element}
              </Label>
            )}
          />
        );
      });

    return (
      <Pivot
        aria-label={formatMessage('Debug Panel Header')}
        selectedKey={isPanelExpanded ? activeTab : null}
        styles={{
          link: {
            height: defaultDebugPanelHeaderHeight,
            lineHeight: defaultDebugPanelHeaderHeight,
            fontSize: FontSizes.size14,
          },
          linkIsSelected: {
            height: defaultDebugPanelHeaderHeight,
            lineHeight: defaultDebugPanelHeaderHeight,
            fontSize: FontSizes.size14,
          },
        }}
      >
        {tabTitles}
      </Pivot>
    );
  }, [isPanelExpanded, activeTab]);

  const activeTabContent = useMemo(() => {
    const configOfActiveTab = debugExtensions.find((ext) => ext.key === activeTab);
    if (!configOfActiveTab || !configOfActiveTab.ContentWidget) return null;

    const { ContentWidget } = configOfActiveTab;
    return <ContentWidget key={`tabContent-${configOfActiveTab.key}`} />;
  }, [activeTab]);

  return (
    <Resizable
      css={css`
        ${debugPaneContainerExpandedStyle}
      `}
      data-testid="debug-panel--expanded"
      defaultSize={{
        width: '100%',
        height: isPanelExpanded ? 300 : defaultDebugPanelHeaderHeight,
      }}
      enable={{
        top: isPanelExpanded,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      maxHeight={isPanelExpanded ? 600 : defaultDebugPanelHeaderHeight}
      minHeight={isPanelExpanded ? 300 : defaultDebugPanelHeaderHeight}
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
            iconProps={{ iconName: isPanelExpanded ? 'ChevronDown' : 'ChevronUp' }}
            styles={{ root: { height: '100%' } }}
            title={formatMessage('Collapse debug panel')}
            onClick={() => {
              if (isPanelExpanded) {
                setPanelExpansion(false);
                setActiveTab(undefined);
                TelemetryClient.track('DrawerPaneClosed');
              } else {
                // By default open into the Problems tab
                setPanelExpansion(true);
                setActiveTab('Diagnostics');
                TelemetryClient.track('DrawerPaneTabOpened', {
                  tabType: 'Diagnostics',
                });
                TelemetryClient.track('DrawerPaneOpened');
              }
            }}
          />
        </div>
      </div>
      <div css={debugPaneContentStyle} data-testid="debug-panel__content">
        {activeTabContent}
      </div>
    </Resizable>
  );
};
