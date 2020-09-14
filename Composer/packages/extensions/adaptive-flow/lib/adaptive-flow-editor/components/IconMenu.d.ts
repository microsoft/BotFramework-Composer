import React from 'react';
interface IconMenuProps {
    nodeSelected?: boolean;
    dataTestId?: string;
    iconName: string;
    iconSize?: number;
    iconStyles?: {
        background?: string;
        color?: string;
        selectors?: {
            [key: string]: any;
        };
    };
    label?: string;
    menuItems: any[];
    menuWidth?: number;
    handleMenuShow?: (menuShowed: boolean) => void;
}
export declare const IconMenu: React.FC<IconMenuProps>;
export {};
//# sourceMappingURL=IconMenu.d.ts.map