// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Panel, IPanelStyles, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

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
} as IPanelStyles;

export const GetStarted: React.FC<GetStartedProps> = (props) => {
  const { projectId, onDismiss } = props;

  const renderTabs = () => {
    return (
      <Stack grow styles={{ root: { alignSelf: 'flex-start', padding: '0 20px' } }}>
        <Pivot styles={{ link: { fontSize: '20px' }, linkIsSelected: { fontSize: '20px' } }}>
          <PivotItem headerText={formatMessage('Next steps')}>
            <GetStartedNextSteps {...props} />
          </PivotItem>
          <PivotItem headerText={formatMessage('Learning')}>
            <GetStartedLearn projectId={projectId} onDismiss={onDismiss} />
          </PivotItem>
        </Pivot>
      </Stack>
    );
  };

  return (
    <Panel
      customWidth="395px"
      isBlocking={false}
      isOpen={props.isOpen}
      styles={panelStyles}
      type={PanelType.custom}
      onDismiss={props.onDismiss}
      onRenderHeader={renderTabs}
    />
  );
};
