// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import pick from 'lodash/pick';
import { ProjectContext, ProjectContextApi } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

import { useStore } from './useStore';

const PROJECT_KEYS = [
  // type ProjectContext
  'data.botName',
  'data.projectId',
  'data.projectCollection',
  'data.dialogs',
  'data.dialogSchemas',
  'data.lgFiles',
  'data.luFiles',
  'data.luFeatures',
  'data.qnaFiles',
  'data.skills',
  'data.skillsSettings',
  'data.schemas',
  'data.forceDisabledActions',
  'data.settings',

  // type ProjectContexApi
  'api.getDialog',
  'api.saveDialog',
  'api.reloadProject',
  'api.navTo',
  'api.updateQnaContent',
  'api.updateRegExIntent',
  'api.renameRegExIntent',
  'api.updateIntentTrigger',
  'api.createDialog',
  'api.commitChanges',
  'api.displayManifestModal',
  'api.updateDialogSchema',
  'api.createTrigger',
  'api.createQnATrigger',
  'api.updateSkill',
  'api.updateRecognizer',
];

export function useProjectApi(): ProjectContext & ProjectContextApi {
  const shell = useStore();

  const projectContext = useMemo(() => {
    const ctx = pick(shell, PROJECT_KEYS);
    return {
      ...ctx.api,
      ...ctx.data,
    } as ProjectContext & ProjectContextApi;
  }, [pick(shell, PROJECT_KEYS)]);

  validateHookContext('project');

  return projectContext;
}
