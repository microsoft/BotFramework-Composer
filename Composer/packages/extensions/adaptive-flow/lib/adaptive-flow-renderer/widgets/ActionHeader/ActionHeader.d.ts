/// <reference types="react" />
import { WidgetComponent, WidgetContainerProps } from '../../types/flowRenderer.types';
export interface ActionHeaderProps extends WidgetContainerProps {
    title?: string;
    disableSDKTitle?: boolean;
    icon?: string;
    menu?: JSX.Element | 'none';
    colors?: {
        theme: string;
        icon: string;
        color: string;
    };
}
export declare const ActionHeader: WidgetComponent<ActionHeaderProps>;
//# sourceMappingURL=ActionHeader.d.ts.map