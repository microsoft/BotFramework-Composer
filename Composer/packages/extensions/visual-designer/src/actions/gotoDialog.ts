// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export const GOTO_DIALOG = 'VISUAL/GOTO_DIALOG';

export default function gotoDialog(eventPath: string) {
  return {
    type: GOTO_DIALOG,
    payload: eventPath,
  };
}
