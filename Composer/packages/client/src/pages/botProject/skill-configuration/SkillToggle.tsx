// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { Toggle } from 'office-ui-fabric-react/lib/components/Toggle';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';

import { dispatcherState, rootBotProjectIdSelector, settingsState } from '../../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../../recoilModel/dispatchers/utils/project';

const toggle = css`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

type Props = {
  projectId: string;
};

export const SkillToggle: React.FC<Props> = ({ projectId }) => {
  const { setSettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const { skillConfiguration } = mergedSettings;

  const updateIsSkill = React.useCallback(
    (isSkill: boolean) => {
      const updatedSetting = {
        ...cloneDeep(mergedSettings),
        skillConfiguration: { ...skillConfiguration, isSkill },
      };
      setSettings(projectId, updatedSetting);
    },
    [mergedSettings, projectId, skillConfiguration]
  );

  const toggleIsSKill = React.useCallback(
    (event, checked?: boolean) => {
      updateIsSkill(!!checked);
    },
    [updateIsSkill]
  );

  return (
    <div css={toggle}>
      <Toggle
        inlineLabel
        checked={!!skillConfiguration?.isSkill}
        label={formatMessage('Allow bot to be called as skill')}
        onChange={toggleIsSKill}
      />
    </div>
  );
};
