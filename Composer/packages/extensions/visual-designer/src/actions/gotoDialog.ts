// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

const GOTO_DIALOG = 'VISUAL/GOTO_DIALOG';

export default function gotoDialog(eventPath: string) {
  return {
    type: GOTO_DIALOG,
    payload: eventPath,
  };
}

export { GOTO_DIALOG };
