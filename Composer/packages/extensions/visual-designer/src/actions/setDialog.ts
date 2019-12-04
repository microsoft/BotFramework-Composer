// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftAdaptiveDialog } from '@bfc/shared';

const SET_DIALOG = 'VISUAL/SET_DIALOG';

export default function setDialog(dialogId: string, dialog: MicrosoftAdaptiveDialog) {
  return {
    type: SET_DIALOG,
    payload: {
      id: dialogId,
      json: dialog,
    },
  };
}

export { SET_DIALOG };
