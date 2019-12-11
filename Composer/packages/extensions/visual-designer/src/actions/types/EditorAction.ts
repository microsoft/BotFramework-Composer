// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { Dispatch } from 'react';

import { EditorActionTypes } from './EditorActionTypes';

export type EditorAction = {
  type: EditorActionTypes;
  payload?: any;
};

export type EditorActionDispatcher = Dispatch<EditorAction>;
