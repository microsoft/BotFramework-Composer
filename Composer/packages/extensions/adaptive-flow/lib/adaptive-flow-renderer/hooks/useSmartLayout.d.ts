import { Boundary } from '../models/Boundary';
import { GraphLayout } from '../models/GraphLayout';
import { GraphNode } from '../models/GraphNode';
declare type MapWithEnumKey<KeyType extends string, ValueType> = {
    [key in KeyType]: ValueType;
};
export declare type GraphNodeMap<T extends string> = MapWithEnumKey<T, GraphNode>;
export declare function useSmartLayout<T extends string>(nodeMap: GraphNodeMap<T>, layouter: (nodeMap: GraphNodeMap<T>) => GraphLayout, onResize: (boundary: Boundary) => void): {
    layout: GraphLayout;
    updateNodeBoundary: (nodeName: T, boundary: Boundary) => void;
};
export {};
//# sourceMappingURL=useSmartLayout.d.ts.map