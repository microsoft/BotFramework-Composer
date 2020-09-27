// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import React, { useCallback, useState } from 'react';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { SkillSetting } from '@bfc/shared';

import { dispatcherState, settingsState, botDisplayNameState } from '../../recoilModel';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';
import { TestController } from '../../components/TestController/TestController';
import { CreateSkillModal } from '../../components/CreateSkillModal';

import { ContainerStyle, ContentHeaderStyle, HeaderText } from './styles';
import SkillSettings from './skill-settings';
import SkillList from './skill-list';

const Skills: React.FC<RouteComponentProps<{ projectId: string }>> = (props) => {
  const { projectId = '' } = props;
  const [showAddSkillDialogModal, setShowAddSkillDialogModal] = useState(false);

  const botName = useRecoilValue(botDisplayNameState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const { addSkill, setSettings } = useRecoilValue(dispatcherState);

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'action',
      text: formatMessage('Connect to a new skill'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => {
          setShowAddSkillDialogModal(true);
        },
      },
      align: 'left',
    },
    {
      type: 'element',
      element: <TestController projectId={projectId} />,
      align: 'right',
    },
  ];

  const onSubmitForm = useCallback(
    (skill: SkillSetting) => {
      addSkill(projectId, skill);
      setShowAddSkillDialogModal(false);
    },
    [projectId]
  );

  const onDismissForm = useCallback(() => {
    setShowAddSkillDialogModal(false);
  }, []);

  return (
    <div css={ContainerStyle} data-testid="skills-page">
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Skills')}</h1>
      </div>
      <div role="main">
        <SkillSettings
          botId={settings.MicrosoftAppId}
          botName={botName}
          botPassword={settings.MicrosoftAppPassword}
          projectId={projectId}
          setSettings={setSettings}
          settings={settings}
          skillHostEndpoint={settings.skillHostEndpoint as string | undefined}
        />
      </div>
      <SkillList projectId={projectId} />
      {showAddSkillDialogModal && (
        <CreateSkillModal projectId={projectId} onDismiss={onDismissForm} onSubmit={onSubmitForm} />
      )}
    </div>
  );
};

export default Skills;
