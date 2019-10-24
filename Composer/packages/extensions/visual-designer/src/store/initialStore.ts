interface StoreState {
  clipboardActions: any[];
  selectedIds: string[];
  focusedIds: string[];
}

const initialStore: StoreState = {
  clipboardActions: [],
  selectedIds: [],
  focusedIds: [],
};

export default initialStore;
