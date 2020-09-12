export declare class SelectorElement {
    bounds: Record<string, any>;
    isSelectable: string | null;
    isNode: string | null;
    isEdgeMenu: string | null;
    isInlineLinkElement: string | null;
    focusedId: string | null;
    selectedId: string;
    tab: string | null;
    constructor(element: HTMLElement);
    hasAttribute(attrName: any): any;
}
export declare enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3
}
export declare enum BoundRect {
    Top = "top",
    Bottom = "bottom",
    Left = "left",
    Right = "right"
}
export declare enum Axle {
    X = 0,
    Y = 1
}
//# sourceMappingURL=type.d.ts.map