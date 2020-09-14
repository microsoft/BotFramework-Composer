/// <reference types="react" />
import { EditorEventHandler } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
import { ElementColor } from '../../adaptive-flow-renderer/constants/ElementColors';
interface NodeMenuProps {
    id: string;
    onEvent: EditorEventHandler;
    colors: ElementColor;
}
export declare const NodeMenu: React.FC<NodeMenuProps>;
export {};
//# sourceMappingURL=NodeMenu.d.ts.map