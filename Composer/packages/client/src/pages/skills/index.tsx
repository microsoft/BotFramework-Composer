// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import React, { useContext, useCallback, useState } from 'react';
import formatMessage from 'format-message';

import { ToolBar } from '../../components/ToolBar/index';
import { TestController } from '../../components/TestController';
import { StoreContext } from '../../store';
import { ISkillFormData } from '../../components/SkillForm/types';
import CreateSkillModal from '../../components/SkillForm/CreateSkillModal';

import { ContainerStyle, ContentHeaderStyle, HeaderText } from './styles';
import SkillSettings from './skill-settings';
import SkillList from './skill-list';

const Skills: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const [editIndex, setEditIndex] = useState<number | undefined>();

  const { skills, projectId, settings, botName } = state;
  const toolbarItems = [
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
    index => {
      const payload = {
        projectId,
        targetId: index,
        skillData: null,
      };
      actions.updateSkill(payload);
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
      actions.updateSkill(payload);
      setEditIndex(undefined);
    },
    [projectId]
  );

  const onDismissForm = useCallback(() => {
    setEditIndex(undefined);
  }, []);

  return (
    <div data-testid="skills-page" css={ContainerStyle}>
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Skills')}</h1>
      </div>
      <div role="main">
        <SkillSettings
          projectId={projectId}
          botName={botName}
          settings={settings}
          setSettings={actions.setSettings}
          botId={settings.MicrosoftAppId}
          skillHostEndpoint={settings.skillHostEndpoint as string | undefined}
        />
      </div>
      <SkillList skills={skills} projectId={projectId} onEdit={idx => setEditIndex(idx)} onDelete={onItemDelete} />
      <CreateSkillModal
        isOpen={typeof editIndex === 'number'}
        skills={skills}
        projectId={projectId}
        editIndex={editIndex}
        onSubmit={onSubmitForm}
        onDismiss={onDismissForm}
      />
    </div>
  );
};

export default Skills;
