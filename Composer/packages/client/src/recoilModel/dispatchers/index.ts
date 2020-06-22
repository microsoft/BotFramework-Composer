// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dialogsDispatcher } from './dialogs';
import { projectDispatcher } from './project';

const dispatchers = [dialogsDispatcher, projectDispatcher];

export default dispatchers;
