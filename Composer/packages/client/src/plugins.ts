// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import json from '@bfc/ui-plugin-json';
import expressions from '@bfc/ui-plugin-expressions';
import prompts from '@bfc/ui-plugin-prompts';
import selectDialog from '@bfc/ui-plugin-select-dialog';
import lg from '@bfc/ui-plugin-lg';
import lu from '@bfc/ui-plugin-luis';
import emitEvent from '@bfc/ui-plugin-emit-event';

export default [json, prompts, selectDialog, lg, lu, expressions, emitEvent];
