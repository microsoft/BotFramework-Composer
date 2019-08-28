import { IObjectWithKey } from 'office-ui-fabric-react/lib/MarqueeSelection';

export class NodeIndexGenerator {
  private _id = 0;

  private _indexByNodeId = {};

  constructor(initialId = 0) {
    this._id = initialId;
  }

  reset(): void {
    this._id = 0;
    this._indexByNodeId = {};
  }

  getNodeIndex(nodeId: string): number {
    let index;

    if (nodeId in this._indexByNodeId) {
      index = this._indexByNodeId[nodeId];
    } else {
      index = this._id++;
      this._indexByNodeId[nodeId] = index;
    }

    return index;
  }

  getItemList(): IObjectWithKey[] {
    const itemList = [];

    const ids = Object.keys(this._indexByNodeId);
    for (const id of ids) {
      const index = this._indexByNodeId[id];
      (itemList[index] as any) = { key: id };
    }

    return itemList;
  }
}
