import React from 'react';
import { NodeProps } from '../nodes/nodeProps';
export declare class RuleGroup extends React.Component<NodeProps> {
  static defaultProps: {
    id: string;
    data: {};
    onEvent: () => void;
    onResize: () => void;
  };
  containerElement: any;
  propagateBoundary(): void;
  renderRule(rule: any, index: number): JSX.Element;
  render(): JSX.Element;
}
//# sourceMappingURL=RuleGroup.d.ts.map
