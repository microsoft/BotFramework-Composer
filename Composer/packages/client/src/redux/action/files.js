import { ActionTypes } from './../../constants/index';

export const getFilesFromServer = () => {
  return {
    type: ActionTypes.FILES_GET,
  };
};
