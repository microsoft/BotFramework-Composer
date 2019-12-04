// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

export interface StoreState {
  selectedIds: string[];
}

export const initialStore: StoreState = {
  selectedIds: [],
};
