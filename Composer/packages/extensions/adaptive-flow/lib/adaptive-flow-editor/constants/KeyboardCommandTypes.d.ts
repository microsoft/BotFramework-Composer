export declare const KeyboardCommandTypes: {
    Cursor: {
        MoveUp: string;
        MoveDown: string;
        MoveLeft: string;
        MoveRight: string;
        ShortMoveUp: string;
        ShortMoveDown: string;
        ShortMoveLeft: string;
        ShortMoveRight: string;
        MovePrevious: string;
        MoveNext: string;
    };
    Node: {
        Delete: string;
        Copy: string;
        Cut: string;
        Paste: string;
    };
    Operation: {
        Redo: string;
        Undo: string;
    };
};
export declare const KeyboardPrimaryTypes: {
    Cursor: string;
    Node: string;
    Operation: string;
};
export declare function mapShortcutToKeyboardCommand(keyCode: any): {
    area: string;
    command: any;
};
//# sourceMappingURL=KeyboardCommandTypes.d.ts.map