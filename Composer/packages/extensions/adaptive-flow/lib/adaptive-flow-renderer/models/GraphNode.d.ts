import { IndexedNode } from './IndexedNode';
import { Boundary } from './Boundary';
declare class CoordPoint {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
}
export declare class GraphNode {
    id: string;
    data: any;
    boundary: Boundary;
    offset: CoordPoint;
    constructor(id?: string, data?: {}, boundary?: Boundary);
    static fromIndexedJson(indexedJson: IndexedNode): GraphNode;
}
export {};
//# sourceMappingURL=GraphNode.d.ts.map