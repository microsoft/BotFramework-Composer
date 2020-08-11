// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dialogsDispatcher } from './dialogs';
import { dialogSchemaDispatcher } from './dialogSchema';
import { projectDispatcher } from './project';
import { applicationDispatcher } from './application';
import { editorDispatcher } from './editor';
import { storageDispatcher } from './storage';
import { exportDispatcher } from './export';
import { lgDispatcher } from './lg';
import { luDispatcher } from './lu';
import { navigationDispatcher } from './navigation';
import { publisherDispatcher } from './publisher';
import { settingsDispatcher } from './setting';
import { skillDispatcher } from './skill';
import { userDispatcher } from './user';
import { multilangDispatcher } from './multilang';
import { formDialogDispatcher } from './formDialog';

const createDispatchers = () => {
  return {
    ...editorDispatcher(),
    ...dialogsDispatcher(),
    ...dialogSchemaDispatcher(),
    ...projectDispatcher(),
    ...applicationDispatcher(),
    ...storageDispatcher(),
    ...exportDispatcher(),
    ...lgDispatcher(),
    ...luDispatcher(),
    ...navigationDispatcher(),
    ...publisherDispatcher(),
    ...settingsDispatcher(),
    ...skillDispatcher(),
    ...userDispatcher(),
    ...multilangDispatcher(),
    ...formDialogDispatcher(),
  };
};

export default createDispatchers;
export type Dispatcher = ReturnType<typeof createDispatchers>;
