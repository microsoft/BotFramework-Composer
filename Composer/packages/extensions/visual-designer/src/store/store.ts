// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export interface StoreState {
  dialog: any;
  eventPath: string;
  focusedId: string;
  focusedTab: string;
  selectedIds: string[];
  clipboardActions: any[];
}

export const initialStore: StoreState = {
  dialog: {},
  eventPath: '',
  focusedId: '',
  focusedTab: '',
  selectedIds: [],
  clipboardActions: [],
};
