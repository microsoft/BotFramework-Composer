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
  statusBarStyle,
  debugPaneContentStyle,
} from './styles';
import debugExtensions from './TabExtensions';
import { DebugDrawerKeys } from './TabExtensions/types';

export interface DebugPanelProps {
  expanded: boolean;
  onToggleExpansion: (expanded: boolean) => void;
}

export const DebugPanel: React.FC = () => {
  const [expanded, setExpansion] = useRecoilState(debugPanelExpansionState);
  const [activeTab, setActiveTab] = useRecoilState(debugPanelActiveTabState);

  const buildTabTitle = useCallback((tabKey: DebugDrawerKeys, TabHeaderWidget: React.FC | string) => {
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
                  setExpansion(true);

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
        maxHeight="600"
        minHeight="200"
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
              styles={{ root: { height: '100%' } }}
              title={formatMessage('Collapse debug panel')}
              onClick={() => {
                setExpansion(false);

                TelemetryClient.track('DrawerPaneClosed');
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
        <div
          css={{ flexGrow: 1 }}
          data-testid="statusbar__blank"
          onClick={() => {
            setExpansion(true);
            setActiveTab('Diagnostics');

            TelemetryClient.track('DrawerPaneOpened');
          }}
        ></div>
        <div css={rightBarStyle} data-testid="statusbar__right">
          <IconButton
            iconProps={{ iconName: 'ChevronUp' }}
            styles={{ root: { height: '100%' } }}
            title={formatMessage('Expand debug panel')}
            onClick={() => {
              setExpansion(true);
              !activeTab && setActiveTab('Diagnostics');

              TelemetryClient.track('DrawerPaneOpened');
            }}
          />
        </div>
      </div>
    );
  }
};
