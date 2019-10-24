const SET_DRAGSELECTION = 'VISUAL/SET_DRAGSELECTION';

export default function setSelection(seletedIds: string[]) {
  return {
    type: SET_DRAGSELECTION,
    payload: {
      ids: seletedIds,
    },
  };
}

export { SET_DRAGSELECTION };
