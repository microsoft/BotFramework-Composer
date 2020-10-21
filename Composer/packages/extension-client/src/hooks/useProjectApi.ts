// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import pick from 'lodash/pick';
import { ProjectContext, ProjectContextApi } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

import { useStore } from './useStore';

const PROJECT_KEYS = [
  'data.botName',
  'data.projectId',
  'data.dialogs',
  'data.dialogSchemas',
  'data.lgFiles',
  'data.luFiles',
  'data.qnaFiles',
  'data.skills',
  'data.skillsSettings',
  'data.schemas',
  'data.settings',

  'api.getDialog',
  'api.saveDialog',
  'api.updateQnaContent',
  'api.updateRegExIntent',
  'api.renameRegExIntent',
  'api.updateIntentTrigger',
  'api.createDialog',
  'api.commitChanges',
  'api.addSkillDialog',
  'api.displayManifestModal',
  'api.updateDialogSchema',
  'api.createTrigger',
  'api.updateSkillSetting',
  'api.reloadProject',
  'api.navTo',
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
