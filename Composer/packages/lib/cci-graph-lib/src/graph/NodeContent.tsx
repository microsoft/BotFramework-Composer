import * as React from 'react';

import { Coord2d, GraphEdge, GraphFlexDirection } from './GraphSchemas';

export type AnchorPointResult = Coord2d | 'NodeDefault' | undefined;

export interface MiniNodeContentProps {
  nodeWidth: number;
  nodeHeight: number;
}

export interface NodeContentProps<TData> {
  data: TData;
  nodeId: string;
  miniNodeContentProps?: MiniNodeContentProps;
  flexDirection?: GraphFlexDirection;
  afterRender?: () => void;
  scrollIntoView?: () => void;
}

// eslint-disable-next-line react/require-render-return
export class NodeContent<TData, TAdditionalProps = {}> extends React.Component<
  NodeContentProps<TData> & TAdditionalProps
> {
  public componentDidMount(): void {
    // NOTE(lin): Use setTimeout to allow DOM updates to settle before edges re-render with new DOM values,
    // as anchors calculation requires accessing the latest DOM.
    setTimeout(() => this.props.afterRender(), 200);
  }

  public componentDidUpdate(): void {
    // NOTE(lin): Use setTimeout to allow DOM updates to settle before edges re-render with new DOM values,
    // as anchors calculation requires accessing the latest DOM.
    setTimeout(() => this.props.afterRender());
  }

  public render(): React.ReactNode {
    throw new Error(`Concrete node content component must implement the render method.`);
  }

  public getEdgeAnchorPoint(_edge: GraphEdge): AnchorPointResult {
    return 'NodeDefault';
  }
}
