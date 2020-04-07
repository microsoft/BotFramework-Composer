// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants/index';
import httpClient from './../../utils/httpUtil';
import { setError } from './error';

export const updateSkill: ActionCreator = async (store, { projectId, targetId, skillData }) => {
  const state = store.getState();
  const { skills: originSkills } = state;
  const skills = [...originSkills];

  // add
  if (targetId === -1 && skillData) {
    skills.push(skillData);
  } else if (targetId >= 0 && targetId < originSkills.length) {
    // modify
    if (skillData) {
      skills.splice(targetId, 1, skillData);

      // delete
    } else {
      skills.splice(targetId, 1);
    }
    // error
  } else {
    throw new Error(`update out of range, skill not found`);
  }

  try {
    const response = await httpClient.post(`/projects/${projectId}/skills/`, { skills });

    store.dispatch({
      type: ActionTypes.UPDATE_SKILL_SUCCESS,
      payload: {
        skills: response.data,
      },
    });
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'UPDATE SKILL ERROR',
    });
  }
};
