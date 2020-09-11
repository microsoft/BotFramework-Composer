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
import { provisionDispatcher } from './provision';
import { settingsDispatcher } from './setting';
import { skillDispatcher } from './skill';
import { userDispatcher } from './user';
import { multilangDispatcher } from './multilang';
import { extensionsDispatcher } from './extensions';

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
    ...provisionDispatcher(),
    ...settingsDispatcher(),
    ...skillDispatcher(),
    ...userDispatcher(),
    ...multilangDispatcher(),
    ...extensionsDispatcher(),
  };
};

export default createDispatchers;
export type Dispatcher = ReturnType<typeof createDispatchers>;
