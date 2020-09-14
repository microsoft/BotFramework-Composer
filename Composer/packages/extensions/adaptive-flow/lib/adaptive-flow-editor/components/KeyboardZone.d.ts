import React, { DOMAttributes } from 'react';
interface KeyboardCommand {
    area: string;
    command: string;
}
export declare type KeyboardCommandHandler = (action: KeyboardCommand, e: React.KeyboardEvent) => object | void;
export declare const enableKeyboardCommandAttributes: (onCommand: KeyboardCommandHandler) => DOMAttributes<HTMLDivElement>;
export {};
//# sourceMappingURL=KeyboardZone.d.ts.map