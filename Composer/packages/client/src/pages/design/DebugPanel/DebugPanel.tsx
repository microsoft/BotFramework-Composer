// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { debugPanelExpansionState } from '../../../recoilModel';

import { debugPaneCollapsedStyle, debugPaneExpandedStyle, debugPaneHeaderStyle } from './styles';
import debugExtensions from './TabExtensions';

export interface DebugPanelProps {
  expanded: boolean;
  onToggleExpansion: (expanded: boolean) => void;
}
export const DebugPanel = () => {
  const [expanded, setExpansion] = useRecoilState(debugPanelExpansionState);

  const [activeTab, setActiveTab] = useState<string>(debugExtensions[0].key);

  const renderTabHeader = useCallback((tabHeaderKey: string, tabHeaderComponent: React.FC | string) => {
    if (typeof tabHeaderComponent === 'string') {
      return <span key={`tabHeader-${tabHeaderKey}`}>{tabHeaderComponent}</span>;
    } else {
      const CollapsedTabHeader = tabHeaderComponent;
      return <CollapsedTabHeader key={`tabHeader-${tabHeaderKey}`} />;
    }
  }, []);

  const collapsedContent = useMemo(() => {
    const tabHeadersCollapsed = debugExtensions.map(({ key, headerCollapsed }) =>
      renderTabHeader(key, headerCollapsed)
    );

    return (
      <div
        css={css`
          ${debugPaneCollapsedStyle}
          ${debugPaneHeaderStyle}
        `}
        data-testid="debug-panel--collapsed"
      >
        <div>{tabHeadersCollapsed}</div>
        <IconButton
          iconProps={{ iconName: 'ChevronUp' }}
          title={formatMessage('Expand debug panel')}
          onClick={() => {
            setExpansion(true);
          }}
        />
      </div>
    );
  }, []);

  const activeTabContent = useMemo(() => {
    const configOfActiveTab = debugExtensions.find((ext) => ext.key === activeTab);
    if (!configOfActiveTab || !configOfActiveTab.content) return null;

    const TabContent = configOfActiveTab.content;
    return <TabContent key={`tabContent-${configOfActiveTab.key}`} />;
  }, [activeTab]);

  const expandedContent = useMemo(() => {
    const tabHeadersExpanded = debugExtensions.map(({ key, headerExpanded }) => renderTabHeader(key, headerExpanded));

    return (
      <div css={debugPaneExpandedStyle} data-testid="debug-panel--expanded">
        <div css={debugPaneHeaderStyle} data-testid="debug-panel__header">
          <div>{tabHeadersExpanded}</div>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            title={formatMessage('Collapse debug panel')}
            onClick={() => {
              setExpansion(false);
            }}
          />
        </div>
        <div data-testid="debug-panel__content">{activeTabContent}</div>
      </div>
    );
  }, [activeTabContent]);

  return expanded ? expandedContent : collapsedContent;
};
