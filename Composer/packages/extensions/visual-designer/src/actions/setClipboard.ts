import { BaseSchema } from 'shared';

const SET_CLIPBOARD = 'VISUAL/SET_CLIPBOARD';

export default function setClipboard(clipboardActions: BaseSchema[]) {
  return {
    type: SET_CLIPBOARD,
    payload: {
      actions: clipboardActions,
    },
  };
}

export { SET_CLIPBOARD };
