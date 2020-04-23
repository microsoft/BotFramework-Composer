// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import expressions from '@bfc/ui-plugin-expressions';
import prompts from '@bfc/ui-plugin-prompts';
import selectDialog from '@bfc/ui-plugin-select-dialog';
import selectSkillDialog from '@bfc/ui-plugin-select-skill-dialog';
import lg from '@bfc/ui-plugin-lg';
import lu from '@bfc/ui-plugin-luis';

export default [prompts, selectDialog, selectSkillDialog, lg, lu, expressions];
