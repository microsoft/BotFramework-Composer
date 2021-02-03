// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo } from 'react';
import { useRecoilState } from 'recoil';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { debugPanelExpansionState } from '../../../recoilModel';

import { debugPaneCollapsedStyle, debugPaneExpandedStyle, debugPaneHeaderStyle } from './styles';

export interface DebugPanelProps {
  expanded: boolean;
  onToggleExpansion: (expanded: boolean) => void;
}
export const DebugPanel = () => {
  const [expanded, setExpansion] = useRecoilState(debugPanelExpansionState);

  const collapsedContent = useMemo(
    () => (
      <div
        css={css`
          ${debugPaneCollapsedStyle}
          ${debugPaneHeaderStyle}
        `}
        data-testid="debug-panel--collapsed"
      >
        <div>Debug Pane: Tabs Preview</div>
        <IconButton
          iconProps={{ iconName: 'ChevronUp' }}
          title={formatMessage('Expand debug panel')}
          onClick={() => {
            setExpansion(true);
          }}
        />
      </div>
    ),
    []
  );

  const expandedContent = useMemo(
    () => (
      <div css={debugPaneExpandedStyle} data-testid="debug-panel--expanded">
        <div css={debugPaneHeaderStyle} data-testid="debug-panel__header">
          <div>Debug Pane: Expanded</div>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            title={formatMessage('Collapse debug panel')}
            onClick={() => {
              setExpansion(false);
            }}
          />
        </div>
        Expanded Pane
      </div>
    ),
    []
  );

  return expanded ? expandedContent : collapsedContent;
};
