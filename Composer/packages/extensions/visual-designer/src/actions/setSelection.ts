const SET_SELECTION = 'VISUAL/SET_SELECTION';

export default function setSelection(seletedIds: string[]) {
  return {
    type: SET_SELECTION,
    payload: {
      ids: seletedIds,
    },
  };
}

export { SET_SELECTION };
