// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import React, { useCallback, useState } from 'react';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import { skillsState, botNameState, settingsState, projectIdState, dispatcherState } from '../../recoilModel';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';
import { TestController } from '../../components/TestController/TestController';
import { CreateSkillModal, ISkillFormData } from '../../components/CreateSkillModal';

import { ContainerStyle, ContentHeaderStyle, HeaderText } from './styles';
import SkillSettings from './skill-settings';
import SkillList from './skill-list';

const Skills: React.FC<RouteComponentProps> = () => {
  const [editIndex, setEditIndex] = useState<number | undefined>();

  const botName = useRecoilValue(botNameState);
  const settings = useRecoilValue(settingsState);
  const projectId = useRecoilValue(projectIdState);
  const skills = useRecoilValue(skillsState);
  const { setSettings, updateSkill } = useRecoilValue(dispatcherState);

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'action',
      text: formatMessage('Connect to a new skill'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => {
          setEditIndex(-1);
        },
      },
      align: 'left',
    },
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  const onItemDelete = useCallback(
    (index) => {
      const payload = {
        projectId,
        targetId: index,
        skillData: null,
      };
      updateSkill(payload);
    },
    [projectId]
  );

  const onSubmitForm = useCallback(
    (submitFormData: ISkillFormData, editIndex: number) => {
      const payload = {
        projectId,
        targetId: editIndex,
        skillData: submitFormData,
      };
      updateSkill(payload);
      setEditIndex(undefined);
    },
    [projectId]
  );

  const onDismissForm = useCallback(() => {
    setEditIndex(undefined);
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
      <SkillList projectId={projectId} skills={skills} onDelete={onItemDelete} onEdit={(idx) => setEditIndex(idx)} />
      <CreateSkillModal
        editIndex={editIndex}
        isOpen={typeof editIndex === 'number'}
        projectId={projectId}
        skills={skills}
        onDismiss={onDismissForm}
        onSubmit={onSubmitForm}
      />
    </div>
  );
};

export default Skills;
