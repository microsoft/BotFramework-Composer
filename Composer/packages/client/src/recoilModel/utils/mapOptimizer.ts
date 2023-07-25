// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Internal tree structure to track the oldest elements and their references.
 */
interface MapOptimizerTree<Key> {
  timestamp: number;
  references: Key[];
}

/**
 * Context for the MapOptimizer.onUpdate event.
 */
interface OnUpdateMapOptimizerContext<Key> {
  /**
   * Sets the related Map keys references of an element, these references are take into account on the delete event.
   * @param references The Map keys of a related element.
   */
  setReferences(references: Key[]): void;
}

/**
 * Class to optimize a Map object by deleting the oldest elements of the collection based on a capacity limit.
 */
export class MapOptimizer<Key, Value> {
  public tree = new Map<Key, MapOptimizerTree<Key>>();
  private skipOptimize = new Set<Key>();

  onUpdateCallback?: (key: Key, value: Value, ctx: OnUpdateMapOptimizerContext<Key>) => void;
  onDeleteCallback?: (key: Key, value: Value) => void;

  /**
   * Initializes a new instance of the MapOptimizer class.
   * @param capacity The capacity limit to trigger the optimization steps.
   * @param list The Map object to optimize.
   */
  constructor(private capacity: number, public list: Map<Key, Value>) {
    this.attach();
  }

  /**
   * Event triggered when an element is added or updated in the Map object.
   * @param callback Exposes the element's Key, Value and Context to perform operations.
   */
  onUpdate(callback: (key: Key, value: Value, ctx: OnUpdateMapOptimizerContext<Key>) => void) {
    this.onUpdateCallback = callback;
  }

  /**
   * Event triggered when an element is marked for deletion.
   * @param callback Exposes the element's Key, Value.
   */
  onDelete(callback: (key: Key, value: Value) => void) {
    this.onDeleteCallback = callback;
  }

  /**
   * @private
   * Attaches the "set" method to the Map object to listen and trigger the optimization.
   */
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

  /**
   * @private
   * Optimizes the Map object by performing the onDelete event callback on the oldest element in the collection.
   */
  private optimize(keyToAdd: Key, valueToAdd: Value) {
    const exists = this.tree.has(keyToAdd);
    const context: MapOptimizerTree<Key> = { timestamp: Date.now(), references: [] };
    this.onUpdateCallback?.(keyToAdd, valueToAdd, {
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

  /**
   * @private
   * Identifies all the keys that are available to delete.
   */
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
