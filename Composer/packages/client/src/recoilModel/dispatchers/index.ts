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
import { qnaDispatcher } from './qna';
import { builderDispatcher } from './builder';
import { navigationDispatcher } from './navigation';
import { publisherDispatcher } from './publisher';
import { settingsDispatcher } from './setting';
import { skillDispatcher } from './skill';
import { userDispatcher } from './user';
import { multilangDispatcher } from './multilang';
import { notificationDispatcher } from './notification';
import { extensionsDispatcher } from './extensions';
import { formDialogsDispatcher } from './formDialogs';
import { botProjectFileDispatcher } from './botProjectFile';
import { zoomDispatcher } from './zoom';

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
    ...qnaDispatcher(),
    ...builderDispatcher(),
    ...navigationDispatcher(),
    ...publisherDispatcher(),
    ...settingsDispatcher(),
    ...skillDispatcher(),
    ...userDispatcher(),
    ...multilangDispatcher(),
    ...notificationDispatcher(),
    ...extensionsDispatcher(),
    ...formDialogsDispatcher(),
    ...botProjectFileDispatcher(),
    ...zoomDispatcher(),
  };
};

export default createDispatchers;
export type Dispatcher = ReturnType<typeof createDispatchers>;
