// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Panel, IPanelStyles } from 'office-ui-fabric-react/lib/Panel';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import { GetStartedNextSteps } from './GetStartedNextSteps';
import { GetStartedLearn } from './GetStartedLearn';

type GetStartedProps = {
  isOpen: boolean;
  showTeachingBubble: boolean;
  requiresLUIS: boolean;
  requiresQNA: boolean;
  onDismiss: () => void;
};

export type NextSteps = {
  checked: boolean;
  key: string;
  label: string;
  checkedLabel: string;
  onClick: () => void;
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

export const GetStarted: React.FC<GetStartedProps> = (props) => {
  const renderTabs = () => {
    return (
      <Pivot styles={{ root: { paddingLeft: 20, paddingTop: 10, width: '100%' } }}>
        <PivotItem headerText={formatMessage('Next steps')}>
          <GetStartedNextSteps
            requiresLUIS={props.requiresLUIS}
            requiresQNA={props.requiresQNA}
            showTeachingBubble={props.showTeachingBubble}
          />
        </PivotItem>
        <PivotItem headerText={formatMessage('Learning')}>
          <GetStartedLearn />
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
