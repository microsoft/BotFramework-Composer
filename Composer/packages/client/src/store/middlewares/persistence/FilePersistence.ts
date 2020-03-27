// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

import { FileChangeType, ResourceInfo } from './types';
import { FileOperation } from './FileOperation';
import { ActionTypes } from './../../../constants';
import { ActionType } from './../../action/types';
import { Store } from './../../types';

function getDialogInfo(type: FileChangeType) {
  const changeType = type;
  return ({ id, content }): ResourceInfo => {
    return { name: `${id}.dialog`, content: JSON.stringify(content, null, 2) + '\n', changeType };
  };
}

function getLuInfo(type: FileChangeType) {
  const changeType = type;
  return ({ id, content }): ResourceInfo => {
    return { name: `${id}.lu`, content, changeType };
  };
}

function getLgInfo(type: FileChangeType) {
  const changeType = type;
  return ({ id, content }): ResourceInfo => {
    return { name: `${id}.lg`, content, changeType };
  };
}

const fileActionType = {
  [ActionTypes.CREATE_DIALOG]: getDialogInfo(FileChangeType.CREATE),
  [ActionTypes.UPDATE_DIALOG]: getDialogInfo(FileChangeType.UPDATE),
  [ActionTypes.REMOVE_DIALOG]: getDialogInfo(FileChangeType.DELETE),
  [ActionTypes.UPDATE_LG]: getLgInfo(FileChangeType.UPDATE),
  [ActionTypes.CREATE_LG]: getLgInfo(FileChangeType.CREATE),
  [ActionTypes.REMOVE_LG]: getLgInfo(FileChangeType.DELETE),
  [ActionTypes.UPDATE_LU]: getLuInfo(FileChangeType.UPDATE),
  [ActionTypes.CREATE_LU]: getLuInfo(FileChangeType.CREATE),
  [ActionTypes.REMOVE_LU]: getLuInfo(FileChangeType.DELETE),
};

class FilePersistence {
  private files: { [fileName: string]: FileOperation };

  constructor() {
    this.files = {};
  }

  public clear() {
    this.files = {};
  }

  public attach(name: string, projectId: string, file?: FileInfo) {
    this.files[name] = new FileOperation(projectId, file);
  }

  public detach(fileName: string) {
    delete this.files[fileName];
  }

  public notify(store: Store, action: ActionType) {
    const getInfo = fileActionType[action.type];
    if (!getInfo) return;

    const { changeType, name, content } = getInfo(action.payload);

    if (changeType === FileChangeType.CREATE) {
      const projectId = store.getState().projectId;
      this.attach(name, projectId);
    }

    this.files[name].operation({ changeType, name, content });

    if (changeType === FileChangeType.DELETE) {
      this.detach(name);
    }
  }
}

const filePersistence = new FilePersistence();

export default filePersistence;
