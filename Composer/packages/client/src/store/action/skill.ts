// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';
import { ActionTypes } from '../../constants';
import httpClient from '../../utils/httpUtil';

import { setError } from './error';

export const createSkillManifest: ActionCreator = ({ dispatch }, { content, id }) => {
  dispatch({
    type: ActionTypes.CREATE_SKILL_MANIFEST,
    payload: {
      content,
      id,
    },
  });
};

export const removeSkillManifest: ActionCreator = ({ dispatch }, id) => {
  dispatch({
    type: ActionTypes.REMOVE_SKILL_MANIFEST,
    payload: {
      id,
    },
  });
};

export const updateSkillManifest: ActionCreator = ({ dispatch }, { content, id }) => {
  dispatch({
    type: ActionTypes.UPDATE_SKILL_MANIFEST,
    payload: {
      content,
      id,
    },
  });
};

export const updateSkill: ActionCreator = async (store, { projectId, targetId, skillData }) => {
  const state = store.getState();
  const { onAddSkillDialogComplete, skills: originSkills } = state;
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

    if (typeof onAddSkillDialogComplete === 'function') {
      const skill = response.data.find(({ manifestUrl }) => manifestUrl === skillData.manifestUrl);
      onAddSkillDialogComplete(skill ? skill : null);
    }

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

export const addSkillDialogBegin: ActionCreator = ({ dispatch }, onComplete) => {
  dispatch({
    type: ActionTypes.ADD_SKILL_DIALOG_BEGIN,
    payload: {
      onComplete,
    },
  });
};

export const addSkillDialogCancel: ActionCreator = ({ dispatch, getState }) => {
  const { onAddSkillDialogComplete } = getState();

  if (typeof onAddSkillDialogComplete === 'function') {
    onAddSkillDialogComplete(null);
  }

  dispatch({
    type: ActionTypes.ADD_SKILL_DIALOG_END,
  });
};

export const addSkillDialogSuccess: ActionCreator = ({ dispatch, getState }) => {
  const { onAddSkillDialogComplete } = getState();
  if (typeof onAddSkillDialogComplete === 'function') {
    onAddSkillDialogComplete(null);
  }

  dispatch({
    type: ActionTypes.ADD_SKILL_DIALOG_END,
  });
};
