// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { SDKTypes } from '@bfc/shared';

import { AdaptiveDialog } from './AdaptiveDialog';
import { AdaptiveEvent } from './AdaptiveEvent';
import { AdaptiveAction } from './AdaptiveAction';

const isRecognizerType = ($type: string) => $type && $type.endsWith('Recognizer');
const isDialogType = ($type: string) => $type === SDKTypes.AdaptiveDialog;
const isTriggerType = ($type: string) => $type.indexOf('Microsoft.On') === 0;

export const resolveAdaptiveDataRenderer = data => {
  if (!data || typeof data.$type !== 'string') return null;

  if (isRecognizerType(data.$type)) return null;

  if (isDialogType(data.$type)) return AdaptiveDialog;

  if (isTriggerType(data.$type)) return AdaptiveEvent;

  return AdaptiveAction;
};
