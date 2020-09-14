import { Boundary } from '../models/Boundary';
export interface NodeProps {
    id: string;
    tab?: string;
    data: any;
    focused?: boolean;
    onEvent: (action: any, id: any, ...rest: any[]) => object | void;
    onResize: (boundary: Boundary, id?: any) => object | void;
    isRoot?: boolean;
}
export declare const defaultNodeProps: {
    id: string;
    data: {};
    onEvent: () => void;
    onResize: () => void;
};
//# sourceMappingURL=nodeProps.d.ts.map