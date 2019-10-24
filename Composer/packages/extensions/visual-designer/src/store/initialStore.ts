interface StoreState {
  clipboardActions: any[];
  selectedIds: [];
}

const initialStore: StoreState = {
  clipboardActions: [],
  selectedIds: [],
};

export default initialStore;
