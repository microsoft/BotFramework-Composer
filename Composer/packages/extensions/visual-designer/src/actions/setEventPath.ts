// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export const SET_EVENTPATH = 'VISUAL/SET_EVENTPATH';

export default function setEventPath(eventPath: string) {
  return {
    type: SET_EVENTPATH,
    payload: eventPath,
  };
}
