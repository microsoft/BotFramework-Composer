// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState, FC } from 'react';
import { useRecoilState } from 'recoil';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import { debugPanelExpansionState } from '../../../recoilModel';

import {
  debugPaneCollapsedStyle,
  debugPaneExpandedStyle,
  debugPaneHeaderStyle,
  leftHeaderStyle,
  rightHeaderStyle,
} from './styles';
import debugExtensions from './TabExtensions';

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
      element = (
        <span
          key={`tabHeader-${tabKey}`}
          onClick={() => {
            setExpansion(true);
            setActiveTab(tabKey);
          }}
        >
          {tabHeaderComponent}
        </span>
      );
    } else {
      const CollapsedTabHeader = tabHeaderComponent;
      // TODO: add toggle control / focus control apis for customized tab extension
      element = <CollapsedTabHeader key={`tabHeader-${tabKey}`} />;
    }
    return { key: tabKey, element };
  }, []);

  const buildTabToolbar = useCallback((tabKey: string, tabToolbarComponent?: React.FC) => {
    if (!tabToolbarComponent) return { key: tabKey, element: null };

    const Toolbar = tabToolbarComponent;
    return { key: tabKey, element: <Toolbar /> };
  }, []);

  const toolbar = useMemo(() => {
    const toolbarItems = debugExtensions
      .map(({ key, toolbar }) => buildTabToolbar(key, toolbar).element)
      .filter(Boolean);
    return <div data-testid="debug-panel__header__toolbar">{toolbarItems}</div>;
  }, []);

  const header = useMemo(() => {
    const tabTitles = debugExtensions
      .map(({ key, headerExpanded }) => buildTabTitle(key, headerExpanded))
      .filter(({ element }) => Boolean(element))
      .map(({ key, element }) => {
        return (
          <PivotItem
            key={`tabHeader-pivot-${key}${expanded ? '--expanded' : ''}`}
            itemKey={key}
            onRenderItemLink={() => element}
          />
        );
      });

    return (
      <div css={debugPaneHeaderStyle} data-testid="debug-panel__header">
        <div css={leftHeaderStyle} data-testid="header__left">
          <Pivot aria-label="Debug Panel Header" selectedKey={activeTab}>
            {tabTitles}
          </Pivot>
        </div>
        <div css={rightHeaderStyle} data-testid="header__right">
          {toolbar}
          <IconButton
            iconProps={{ iconName: expanded ? 'Cancel' : 'ChevronUp' }}
            title={expanded ? formatMessage('Collapse debug panel') : formatMessage('Expand debug panel')}
            onClick={() => {
              setExpansion(!expanded);
            }}
          />
        </div>
      </div>
    );
  }, [expanded]);

  const activeTabContent = useMemo(() => {
    const configOfActiveTab = debugExtensions.find((ext) => ext.key === activeTab);
    if (!configOfActiveTab || !configOfActiveTab.content) return null;

    const TabContent = configOfActiveTab.content;
    return <TabContent key={`tabContent-${configOfActiveTab.key}`} />;
  }, [activeTab]);

  return (
    <div
      css={css`
        ${expanded ? debugPaneExpandedStyle : debugPaneCollapsedStyle}
      `}
      data-testid="debug-panel--expanded"
    >
      {header}
      {expanded ? <div data-testid="debug-panel__content">{activeTabContent}</div> : null}
    </div>
  );
};
