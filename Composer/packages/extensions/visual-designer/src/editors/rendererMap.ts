// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { SDKTypes } from '@bfc/shared';

import { StepRenderer } from '../components/renderers/StepRenderer';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';
import { RuleEditor } from './RuleEditor';

const isRecognizerType = ($type: string) => $type && $type.endsWith('Recognizer');
const isDialogType = ($type: string) => $type === SDKTypes.AdaptiveDialog;
const isTriggerType = ($type: string) => $type.indexOf('Microsoft.On') === 0;

export const resolveAdaptiveDataRenderer = data => {
  if (!data || typeof data.$type !== 'string') return null;

  if (isRecognizerType(data.$type)) return null;

  if (isDialogType(data.$type)) return AdaptiveDialogEditor;

  if (isTriggerType(data.$type)) return RuleEditor;

  return StepRenderer;
};
