// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Panel, IPanelStyles } from 'office-ui-fabric-react/lib/Panel';
import { Pivot, PivotItem, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';

import { GetStartedNextSteps } from './GetStartedNextSteps';
import { GetStartedLearn } from './GetStartedLearn';

type GetStartedProps = {
  isOpen: boolean;
  showTeachingBubble: boolean;
  requiresLUIS: boolean;
  requiresQNA: boolean;
  projectId: string;
  onDismiss: () => void;
  onBotReady: () => void;
};

const panelStyles = {
  root: {
    marginTop: 50,
  },
  navigation: {
    display: 'block',
    height: 'auto',
  },
} as IPanelStyles;

const pivotStyles = { root: { paddingLeft: 20, paddingTop: 10, width: '100%' } } as IPivotStyles;

export const GetStarted: React.FC<GetStartedProps> = (props) => {
  const { projectId, onDismiss } = props;

  const renderTabs = () => {
    return (
      <Pivot styles={pivotStyles}>
        <PivotItem headerText={formatMessage('Next steps')}>
          <GetStartedNextSteps {...props} />
        </PivotItem>
        <PivotItem headerText={formatMessage('Learning')}>
          <GetStartedLearn projectId={projectId} onDismiss={onDismiss} />
        </PivotItem>
      </Pivot>
    );
  };

  const onRenderNavigationContent = React.useCallback(
    (props, defaultRender) => (
      <div css={{ position: 'absolute', top: 15, right: 0, zIndex: 1 }}>{defaultRender(props)}</div>
    ),
    []
  );

  return (
    <Panel
      isBlocking={false}
      isOpen={props.isOpen}
      styles={panelStyles}
      onDismiss={props.onDismiss}
      onRenderHeader={renderTabs}
      onRenderNavigationContent={onRenderNavigationContent}
    />
  );
};
