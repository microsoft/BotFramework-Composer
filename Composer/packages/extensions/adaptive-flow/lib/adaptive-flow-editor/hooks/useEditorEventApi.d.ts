import { ShellApi } from '@bfc/shared';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
import { NodeRendererContextValue } from '../contexts/NodeRendererContext';
import { SelectionContextData } from '../contexts/SelectionContext';
export declare const useEditorEventApi: (
  state: {
    path: string;
    data: any;
    nodeContext: NodeRendererContextValue;
    selectionContext: SelectionContextData;
  },
  shellApi: ShellApi
) => {
  handleEditorEvent: (eventName: NodeEventTypes, eventData?: any) => any;
};
//# sourceMappingURL=useEditorEventApi.d.ts.map
