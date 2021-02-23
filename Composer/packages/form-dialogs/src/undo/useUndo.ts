// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { UndoContext } from './UndoRoot';

export const useUndo = () => React.useContext(UndoContext);
