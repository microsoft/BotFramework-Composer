// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dialogsDispatcher } from './dialogs';
import { projectDispatcher } from './project';
import { applicationDispatcher } from './application';
import { editorDispatcher } from './editor';
import { storageDispatcher } from './storage';
import { userDispatcher } from './user';

const createDispatchers = () => {
  return {
    ...editorDispatcher(),
    ...dialogsDispatcher(),
    ...projectDispatcher(),
    ...applicationDispatcher(),
    ...storageDispatcher(),
    ...userDispatcher(),
  };
};

export default createDispatchers;
export type Dispatcher = ReturnType<typeof createDispatchers>;
