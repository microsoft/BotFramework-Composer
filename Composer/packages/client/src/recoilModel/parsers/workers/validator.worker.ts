// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { validateDialog } from '@bfc/indexers';

import { ValidateActionType, ValidatorPayload } from '../types';

const ctx: Worker = self as any;

type Message = {
  id: string;
  type: ValidateActionType.DialogValidator;
  payload: ValidatorPayload;
};

export const handleMessage = (msg: Message) => {
  const { dialog, schema, settings, lgFiles, luFiles } = msg.payload;
  return validateDialog(dialog, schema, settings, lgFiles, luFiles);
};

ctx.onmessage = function (event) {
  const msg = event.data as Message;

  try {
    const payload = handleMessage(msg);
    ctx.postMessage({ id: msg.id, payload });
  } catch (error) {
    ctx.postMessage({ id: msg.id, error: error.message });
  }
};
