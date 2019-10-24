export interface StoreState {
  clipboardActions: any[];
  selectedIds: string[];
  focusedIds: string[];
}

export const initialStore: StoreState = {
  clipboardActions: [],
  selectedIds: [],
  focusedIds: [],
};
