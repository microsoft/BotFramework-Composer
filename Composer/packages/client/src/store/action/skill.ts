// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import get from 'lodash/get';

import { ActionCreator } from '../types';
import { ISkillFormData } from '../../pages/skills/types';

import { ActionTypes } from './../../constants/index';
import httpClient from './../../utils/httpUtil';
import { setError } from './error';

export const updateSkill: ActionCreator = async (store, { projectId, targetId, skillData }) => {
  const state = store.getState();
  const { settings: originSettings } = state;
  const originSkills: ISkillFormData[] = get(originSettings, 'skill', []);
  const updatedSkills = [...originSkills];

  console.log(projectId, originSkills, targetId, skillData);

  if (skillData) {
    const { manifestUrl } = skillData;
    const res = await httpClient.get(manifestUrl);
    console.log(res);
  }

  // add
  if (targetId === -1 && skillData) {
    updatedSkills.push(skillData);
  } else if (targetId >= 0 && targetId < originSkills.length) {
    // modify
    if (skillData) {
      updatedSkills.splice(targetId, 1, skillData);

      // delete
    } else {
      updatedSkills.splice(targetId, 1);
    }
    // error
  } else {
    throw new Error(`update out of range, skill not found`);
  }

  console.log(updatedSkills);
  const settings = {
    ...originSettings,
    skill: updatedSkills,
  };
  console.log(settings);

  try {
    store.dispatch({
      type: ActionTypes.SYNC_ENV_SETTING,
      payload: {
        settings,
      },
    });
    await httpClient.post(`/projects/${projectId}/settings/`, { settings });
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'UPDATE SKILL ERROR',
    });
  }
};
