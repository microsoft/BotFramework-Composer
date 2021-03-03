// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useMemo } from 'react';
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
  debugPaneContainerStyle,
  debugPaneBarStyle,
  leftBarStyle,
  rightBarStyle,
  debugPaneHeaderStyle,
  debugPaneContentStyle,
  debugPaneFooterStyle,
} from './styles';
import debugExtensions from './TabExtensions';
import { DebugDrawerKeys, DebugPanelTabHeaderProps } from './TabExtensions/types';

export const DebugPanel: React.FC = () => {
  const [isPanelExpanded, setPanelExpansion] = useRecoilState(debugPanelExpansionState);
  const [activeTab, setActiveTab] = useRecoilState(debugPanelActiveTabState);

  const onExpandPanel = useCallback((activeTabKey: DebugDrawerKeys) => {
    setPanelExpansion(true);
    setActiveTab(activeTabKey);
    TelemetryClient.track('DrawerPaneTabOpened', {
      tabType: activeTabKey,
    });
    TelemetryClient.track('DrawerPaneOpened');
  }, []);

  const onCollapsePanel = useCallback(() => {
    setPanelExpansion(false);
    setActiveTab(undefined);
    TelemetryClient.track('DrawerPaneClosed');
  }, []);

  const buildTabTitle = (tabKey: DebugDrawerKeys, TabHeaderWidget: React.FC<DebugPanelTabHeaderProps> | string) => {
    if (!TabHeaderWidget) return { key: tabKey, element: null };

    let element: JSX.Element;
    if (typeof TabHeaderWidget === 'string') {
      element = <span key={`tabHeader-${tabKey}`}>{TabHeaderWidget}</span>;
    } else {
      element = <TabHeaderWidget key={`tabHeader-${tabKey}`} isActive={activeTab === tabKey} />;
    }
    return { key: tabKey, element };
  };

  const computedPivotHeight = isPanelExpanded ? 36 : 24;

  const headerPivot = useMemo(() => {
    const tabTitles = debugExtensions
      .map(({ key, HeaderWidget }) => buildTabTitle(key, HeaderWidget))
      .filter(({ element }) => Boolean(element))
      .map(({ key, element }) => {
        return (
          <PivotItem
            key={`tabHeader-pivot-${key}`}
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
                  onExpandPanel(key);
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
            height: computedPivotHeight,
            lineHeight: computedPivotHeight,
            fontSize: FontSizes.size14,
          },
          linkIsSelected: {
            height: computedPivotHeight,
            lineHeight: computedPivotHeight,
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
        ${debugPaneContainerStyle}
      `}
      data-testid="debug-panel"
      defaultSize={{
        width: '100%',
        height: isPanelExpanded ? 300 : computedPivotHeight,
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
      maxHeight={isPanelExpanded ? 600 : computedPivotHeight}
      minHeight={isPanelExpanded ? 200 : computedPivotHeight}
    >
      <div
        css={css`
          ${debugPaneBarStyle}
          ${isPanelExpanded ? debugPaneHeaderStyle : debugPaneFooterStyle}
        `}
        data-testid={isPanelExpanded ? 'debug-panel__header' : 'debug-panel__footer'}
      >
        <div css={leftBarStyle} data-testid="header__left">
          {headerPivot}
        </div>
        <div
          css={{ flexGrow: 1 }}
          data-testid="header__blank"
          onClick={() => {
            if (!isPanelExpanded) {
              onExpandPanel('Diagnostics');
            }
          }}
        ></div>
        <div css={rightBarStyle} data-testid="header__right">
          <IconButton
            iconProps={{ iconName: isPanelExpanded ? 'ChevronDown' : 'ChevronUp' }}
            styles={{ root: { height: '100%' } }}
            title={formatMessage('Collapse debug panel')}
            onClick={() => {
              if (isPanelExpanded) {
                onCollapsePanel();
              } else {
                onExpandPanel('Diagnostics');
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
