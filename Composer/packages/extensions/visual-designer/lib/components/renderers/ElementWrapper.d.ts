import { FC } from 'react';
import { NodeEventTypes } from '../../constants/NodeEventTypes';
export interface ElementWrapperProps {
  id: string;
  tab?: string;
  titleInHeader?: boolean;
  onEvent: (eventName: NodeEventTypes, eventData: any) => any;
}
export declare const ElementWrapper: FC<ElementWrapperProps>;
//# sourceMappingURL=ElementWrapper.d.ts.map
