// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dialogsDispatcher } from './dialogs';
import { projectDispatcher } from './project';
import { applicationDispatcher } from './application';
import { editorDispatcher } from './editor';
import { storageDispatcher } from './storage';

const dispatchers = [editorDispatcher, dialogsDispatcher, projectDispatcher, applicationDispatcher, storageDispatcher];

export default dispatchers;
