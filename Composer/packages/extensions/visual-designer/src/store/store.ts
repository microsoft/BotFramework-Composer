// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export interface StoreState {
  dialog: {
    json: any;
  };
  editor: {
    focusedEvent: string;
    focusedId: string;
    selectedIds: string[];
  };
  clipboard: {
    actions: any[];
  };
}

export const initialStore: StoreState = {
  dialog: {
    json: {},
  },
  editor: {
    focusedEvent: '',
    focusedId: '',
    selectedIds: [],
  },
  clipboard: {
    actions: [],
  },
};
