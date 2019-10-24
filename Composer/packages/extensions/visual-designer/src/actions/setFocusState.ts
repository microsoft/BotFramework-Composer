const SET_FOCUSSTATE = 'VISUAL/SET_FOCUSSTATE';

export default function setFocusState(focusedIds: string[]) {
  return {
    type: SET_FOCUSSTATE,
    payload: {
      ids: focusedIds,
    },
  };
}

export { SET_FOCUSSTATE };
