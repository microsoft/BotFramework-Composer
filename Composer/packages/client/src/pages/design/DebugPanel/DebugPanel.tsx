// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import formatMessage from 'format-message';
import { IconButton } from '@fluentui/react/lib/Button';
import { IPivot, Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { FontSizes } from '@fluentui/theme';
import { Resizable } from 're-resizable';
import { Label } from '@fluentui/react/lib/Label';
import { useRecoilValue } from 'recoil';
import { useId } from '@fluentui/react-hooks';

import TelemetryClient from '../../../telemetry/TelemetryClient';
import { debugPanelExpansionState, debugPanelActiveTabState, dispatcherState } from '../../../recoilModel';

import {
  debugPaneContainerStyle,
  debugPaneBarStyle,
  leftBarStyle,
  rightBarStyle,
  debugPaneHeaderStyle,
  debugPaneContentStyle,
  debugPaneFooterStyle,
  expandedPanelHeaderHeight,
  collapsedPaneHeaderHeight,
  debugPanelDefaultHeight,
  debugPanelMaxExpandedHeight,
  debugPanelMinHeight,
} from './styles';
import debugExtensions from './TabExtensions';
import { DebugDrawerKeys, DebugPanelTabHeaderProps } from './TabExtensions/types';

export const DebugPanel: React.FC = () => {
  const { setActiveTabInDebugPanel, setDebugPanelExpansion } = useRecoilValue(dispatcherState);
  const isPanelExpanded = useRecoilValue(debugPanelExpansionState);
  const activeTab = useRecoilValue(debugPanelActiveTabState);
  const pivotRef = useRef<IPivot>(null);
  const contentId = useId('debug-panel-content');

  useEffect(() => {
    if (isPanelExpanded) {
      pivotRef.current?.focus();
    }
  }, [isPanelExpanded, activeTab]);

  const onExpandPanel = useCallback((activeTabKey: DebugDrawerKeys) => {
    setDebugPanelExpansion(true);
    setActiveTabInDebugPanel(activeTabKey);
    TelemetryClient.track('DrawerPaneTabOpened', {
      tabType: activeTabKey,
    });
    TelemetryClient.track('DrawerPaneOpened');
  }, []);

  const onCollapsePanel = useCallback(() => {
    setDebugPanelExpansion(false);
    TelemetryClient.track('DrawerPaneClosed');
  }, []);

  const onDebugPaneClick = () => {
    if (!isPanelExpanded) {
      onExpandPanel('Diagnostics');
    } else {
      onCollapsePanel();
    }
  };

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

  const computedPivotHeight = isPanelExpanded ? expandedPanelHeaderHeight : collapsedPaneHeaderHeight;

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
                  cursor: 'pointer',
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
        componentRef={pivotRef}
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
        onLinkClick={(pivotItem) => {
          if (pivotItem?.props.itemKey != null) onExpandPanel(pivotItem?.props.itemKey as DebugDrawerKeys);
        }}
      >
        {tabTitles}
      </Pivot>
    );
  }, [isPanelExpanded, activeTab]);

  return (
    <div aria-label={formatMessage('debug panel')} role="region">
      <Resizable
        css={css`
          ${debugPaneContainerStyle}
        `}
        data-testid="DebugPanelDrawer"
        defaultSize={{
          width: '100%',
          height: isPanelExpanded ? debugPanelDefaultHeight : computedPivotHeight,
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
        maxHeight={isPanelExpanded ? debugPanelMaxExpandedHeight : computedPivotHeight}
        minHeight={isPanelExpanded ? debugPanelMinHeight : computedPivotHeight}
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
            aria-controls={contentId}
            aria-expanded={isPanelExpanded ? 'true' : 'false'}
            aria-label={formatMessage('Toggle debug panel')}
            css={{ flexGrow: 1, cursor: 'pointer', outline: 'none' }}
            data-testid="header__blank"
            role="button"
            tabIndex={-1}
            onClick={onDebugPaneClick}
            onKeyPress={onDebugPaneClick}
          />
          <div css={rightBarStyle} data-testid="header__right">
            <IconButton
              aria-controls={contentId}
              aria-expanded={isPanelExpanded ? 'true' : 'false'}
              iconProps={{ iconName: isPanelExpanded ? 'ChevronDown' : 'ChevronUp' }}
              styles={{ root: { height: '100%' } }}
              title={isPanelExpanded ? formatMessage('Collapse Debug Panel') : formatMessage('Expand Debug Panel')}
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
        <div
          aria-label={formatMessage('Debug panel tab content')}
          css={debugPaneContentStyle}
          data-testid="debug-panel__content"
          id={contentId}
          role="region"
        >
          {debugExtensions.map((debugTabs) => {
            const { ContentWidget } = debugTabs;
            return (
              <ContentWidget
                key={`tabContent-${debugTabs.key}`}
                isActive={activeTab === debugTabs.key && isPanelExpanded}
              />
            );
          })}
        </div>
      </Resizable>
    </div>
  );
};
