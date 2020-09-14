import { FC } from 'react';
import { PromptTab } from '@bfc/shared';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
export interface NodeWrapperProps {
    id: string;
    tab?: PromptTab;
    data: any;
    onEvent: (eventName: NodeEventTypes, eventData: any) => any;
}
export declare const ActionNodeWrapper: FC<NodeWrapperProps>;
//# sourceMappingURL=NodeWrapper.d.ts.map