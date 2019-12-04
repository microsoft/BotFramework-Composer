// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export interface StoreState {
  dialog: {
    id: string;
    json: any;
  };
  eventPath: string;
  focusedId: string;
  focusedTab: string;
  selectedIds: string[];
  clipboardActions: any[];
}

export const initialStore: StoreState = {
  dialog: {
    id: '',
    json: {},
  },
  eventPath: '',
  focusedId: '',
  focusedTab: '',
  selectedIds: [],
  clipboardActions: [],
};
