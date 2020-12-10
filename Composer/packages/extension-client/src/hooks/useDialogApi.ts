// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import pick from 'lodash/pick';
import { DialogEditingContext, DialogEditingContextApi } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

import { useStore } from './useStore';

const DIALOG_KEYS = [
  // type DialogEditingContext
  'data.currentDialog',
  'data.designerId',
  'data.dialogId',
  'data.clipboardActions',
  'data.focusedEvent',
  'data.focusedActions',
  'data.focusedSteps',
  'data.focusedTab',
  'data.focusPath',

  // type DialogEditingContextApi
  'api.saveData',
  'api.onOpenDialog',
  'api.onFocusSteps',
  'api.onFocusEvent',
  'api.onSelect',
  'api.onCopy',
  'api.undo',
  'api.redo',
];

export function useDialogApi(): DialogEditingContext & DialogEditingContextApi {
  const shell = useStore();

  const dialogContext = useMemo(() => {
    const ctx = pick(shell, DIALOG_KEYS);
    return {
      ...ctx.api,
      ...ctx.data,
    } as DialogEditingContext & DialogEditingContextApi;
  }, [pick(shell, DIALOG_KEYS)]);

  validateHookContext('dialog');

  return dialogContext;
}
