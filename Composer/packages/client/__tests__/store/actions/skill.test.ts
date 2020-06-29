// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  createSkillManifest,
  removeSkillManifest,
  updateSkillManifest,
  addSkillDialogBegin,
  displayManifestModal,
  dismissManifestModal,
} from '../../../src/store/action/skill';
import { ActionTypes } from '../../../src/constants';

import { runTrivialTests } from './testUtils';

runTrivialTests([
  { action: createSkillManifest, type: ActionTypes.CREATE_SKILL_MANIFEST, fields: ['content', 'id'] },
  {
    action: removeSkillManifest,
    type: ActionTypes.REMOVE_SKILL_MANIFEST,
    fields: ['id'],
    unwrap: true,
  },
  { action: updateSkillManifest, type: ActionTypes.UPDATE_SKILL_MANIFEST, fields: ['content', 'id'] },
  { action: addSkillDialogBegin, type: ActionTypes.ADD_SKILL_DIALOG_BEGIN, fields: ['onComplete'], unwrap: true },
  { action: displayManifestModal, type: ActionTypes.DISPLAY_SKILL_MANIFEST_MODAL, fields: ['id'], unwrap: true },
  { action: dismissManifestModal, type: ActionTypes.DISMISS_SKILL_MANIFEST_MODAL },
]);
