// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export interface StoreState {
  dialog: any;
  focusedEvent: string;
  focusedId: string;
  selectedIds: string[];
  clipboardActions: any[];
}

export const initialStore: StoreState = {
  dialog: {},
  focusedEvent: '',
  focusedId: '',
  selectedIds: [],
  clipboardActions: [],
};
