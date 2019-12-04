// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { BaseSchema } from '@bfc/shared';

const SET_CLIPBOARD = 'VISUAL/SET_CLIPBOARD';

export default function setClipboard(clipboardActions: BaseSchema[]) {
  return {
    type: SET_CLIPBOARD,
    payload: clipboardActions,
  };
}

export { SET_CLIPBOARD };
