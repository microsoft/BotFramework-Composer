// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export const SET_DRAGSELECTION = 'VISUAL/SET_DRAGSELECTION';

export default function setDragSelection(seletedIds: string[]) {
  return {
    type: SET_DRAGSELECTION,
    payload: seletedIds,
  };
}
