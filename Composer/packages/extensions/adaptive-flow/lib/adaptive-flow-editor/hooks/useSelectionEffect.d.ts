/// <reference types="react" />
import { Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { ShellApi } from '@bfc/shared';
import { SelectorElement } from '../utils/cursorTracker';
import { NodeRendererContextValue } from '../contexts/NodeRendererContext';
export declare const useSelectionEffect: (state: {
    data: any;
    nodeContext: NodeRendererContextValue;
}, shellApi: ShellApi) => {
    selection: Selection<import("office-ui-fabric-react/lib/MarqueeSelection").IObjectWithKey>;
    selectedIds: string[];
    setSelectedIds: import("react").Dispatch<import("react").SetStateAction<string[]>>;
    selectableElements: SelectorElement[];
    getNodeIndex: (nodeId: string) => number;
    getSelectableIds: () => string[];
};
//# sourceMappingURL=useSelectionEffect.d.ts.map