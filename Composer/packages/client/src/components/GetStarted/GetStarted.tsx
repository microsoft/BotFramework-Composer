// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { useState, useCallback } from 'react';
import formatMessage from 'format-message';
import { Panel, IPanelStyles, PanelType } from '@fluentui/react/lib/Panel';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { Stack } from '@fluentui/react/lib/Stack';

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

const panelStyles: Partial<IPanelStyles> = {
  root: {
    marginTop: 50,
  },
};

enum GetStartedTab {
  GetStarted = 'GetStarted',
  LearnMore = 'LearnMore',
}

interface ActiveTabContentProps {
  activeTab: GetStartedTab;
  tabProps: GetStartedProps;
}

const ActiveTabContent: React.FC<ActiveTabContentProps> = ({ activeTab, tabProps }) => {
  switch (activeTab) {
    case GetStartedTab.GetStarted:
      return <GetStartedNextSteps {...tabProps} />;
    case GetStartedTab.LearnMore: {
      const { projectId, onDismiss } = tabProps;
      return <GetStartedLearn {...{ projectId, onDismiss }} />;
    }
    default:
      return null;
  }
};

export const GetStarted: React.FC<GetStartedProps> = (props) => {
  const [activeTab, setActiveTab] = useState(GetStartedTab.GetStarted);

  const handleLinkClick = useCallback((item?: PivotItem) => {
    if (item) {
      setActiveTab(item.props.itemKey as GetStartedTab);
    }
  }, []);

  const renderTabs = useCallback(() => {
    return (
      <Stack grow styles={{ root: { alignSelf: 'flex-start', padding: '0 20px' } }}>
        <Pivot
          styles={{ link: { fontSize: '20px' }, linkIsSelected: { fontSize: '20px' } }}
          onLinkClick={handleLinkClick}
        >
          <PivotItem headerText={formatMessage('Get started')} itemKey={GetStartedTab.GetStarted} />
          <PivotItem headerText={formatMessage('Learn more')} itemKey={GetStartedTab.LearnMore} />
        </Pivot>
      </Stack>
    );
  }, []);

  return (
    <Panel
      closeButtonAriaLabel={formatMessage('Close Get Started panel')}
      customWidth="395px"
      isBlocking={false}
      isOpen={props.isOpen}
      styles={panelStyles}
      type={PanelType.custom}
      onDismiss={props.onDismiss}
      onRenderHeader={renderTabs}
    >
      <ActiveTabContent activeTab={activeTab} tabProps={props} />
    </Panel>
  );
};
