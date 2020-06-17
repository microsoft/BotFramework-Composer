import { IObjectWithKey } from 'office-ui-fabric-react/lib/MarqueeSelection';
export declare class NodeIndexGenerator {
  private _id;
  private _indexByNodeId;
  constructor(initialId?: number);
  reset(): void;
  getNodeIndex(nodeId: string): number;
  getItemList(): IObjectWithKey[];
}
//# sourceMappingURL=NodeIndexGetter.d.ts.map
