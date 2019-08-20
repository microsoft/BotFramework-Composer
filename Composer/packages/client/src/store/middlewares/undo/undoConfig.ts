import { State } from '../../types';
import { updateDialog } from '../../action';

import { ActionTypes } from './../../../constants/index';
import { UndoConfig } from './types';

export const undoConfig: UndoConfig = {
  revertibleActions: {
    [ActionTypes.UPDATE_DIALOG]: {
      actionCreator: updateDialog,
      mapStateToArgs: (action, state: State) => {
        const id = state.designPageLocation.dialogId;
        const dialog = state.dialogs.find(dialog => dialog.id === id);
        return { id, content: dialog ? dialog.content : {} };
      },
    },
  },
};
