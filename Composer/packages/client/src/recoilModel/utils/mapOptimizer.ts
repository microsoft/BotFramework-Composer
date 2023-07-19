interface MapOptimizerTree<Key> {
  timestamp: number;
  references: Key[];
}

interface OnUpdateMapOptimizerContext<Key> {
  setReferences(references: Key[]): void;
}

export class MapOptimizer<Key, Value> {
  public tree = new Map<Key, MapOptimizerTree<Key>>();
  private skipOptimize = new Set<Key>();

  opUpdateCallback?: (key: Key, value: Value, ctx: OnUpdateMapOptimizerContext<Key>) => void;
  onDeleteCallback?: (key: Key, value: Value) => void;

  constructor(private capacity: number, public list: Map<Key, Value>) {
    this.attach();
  }

  onUpdate(callback: (key: Key, value: Value, ctx: OnUpdateMapOptimizerContext<Key>) => void) {
    this.opUpdateCallback = callback;
  }

  onDelete(callback: (key: Key, value: Value) => void) {
    this.onDeleteCallback = callback;
  }

  private attach() {
    const set = this.list.set;
    this.list.set = (key, value) => {
      if (!this.skipOptimize.has(key)) {
        this.optimize(key, value);
      }
      const result = set.apply(this.list, [key, value]);
      return result;
    };
  }

  private optimize(keyToAdd: Key, valueToAdd: Value) {
    const exists = this.tree.has(keyToAdd);
    const context: MapOptimizerTree<Key> = { timestamp: Date.now(), references: [] };
    this.opUpdateCallback?.(keyToAdd, valueToAdd, {
      setReferences: (references) => (context.references = references || []),
    });
    this.tree.set(keyToAdd, context);

    if (exists) {
      return;
    }

    let processed: [Key, MapOptimizerTree<Key>][] = [];
    const itemsToRemove = Array.from(this.tree.entries())
      .filter(([key]) => key !== keyToAdd)
      .sort(([, v1], [, v2]) => v2.timestamp - v1.timestamp);

    while (this.capacity < this.tree.size) {
      const itemToRemove = itemsToRemove.pop();
      if (!itemToRemove) {
        break;
      }

      const [key, { references }] = itemToRemove;
      const ids = this.identify([key, ...references]);

      // Re-process previous items if an item gets deleted.
      processed.push(itemToRemove);
      if (ids.length > 0) {
        itemsToRemove.push(...processed);
        processed = [];
      }

      for (const id of ids) {
        this.tree.delete(id);
        const listItem = this.list.get(id)!;
        this.skipOptimize.add(id);
        this.onDeleteCallback ? this.onDeleteCallback(id, listItem) : this.list.delete(id);
        this.skipOptimize.delete(id);
      }
    }
  }

  private identify(references: Key[], memo: Key[] = []) {
    for (const reference of references) {
      const found = this.tree.get(reference);
      const existsOnMemo = () => memo.some((e) => found!.references.includes(e));
      const existsOnReferences = () =>
        Array.from(this.tree.values()).some(({ references }) => references.includes(reference));

      if (!found || existsOnMemo() || existsOnReferences()) {
        continue;
      }

      memo.push(reference);
      this.identify(found.references, memo);
    }

    return memo;
  }
}
