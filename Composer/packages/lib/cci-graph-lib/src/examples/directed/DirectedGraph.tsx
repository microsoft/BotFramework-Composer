import * as React from 'react';
import { Graph } from '../../graph/Graph';
import { GraphEdge } from '../../graph/GraphSchemas';
import { GraphNode, Node } from '../../graph/Node';
import './DirectedGraph.scss';
import { DirectedGraphItem } from './DirectedGraphItem';

interface DirectedGraphState {
  nodes: GraphNode<DirectedGraphItem>[];
  edges: GraphEdge[];
  prevItems: DirectedGraphItem[];
}

interface DirectedGraphPropsType {
  items: DirectedGraphItem[];
  width: number;
  height: number;
}

const EMPTY_ONCLICK_EVENT = () => {};

export class DirectedGraph extends React.Component<DirectedGraphPropsType, DirectedGraphState> {
  static defaultProps = {
    width: 600,
    height: 600,
  };

  state = {
    nodes: [],
    edges: [],
    prevItems: undefined,
  };

  public render(): React.ReactNode {
    const { width, height, items } = this.props;
    const { nodes, edges } = this.computeGraphElements(items);

    return (
      <div className="graph-container">
        <Graph
          nodeList={nodes}
          edgeList={edges}
          graphOptions={{
            nodeAlignmentStyle: 'Symmetric',
            marginOffsetTopLeft: {
              x: 100,
              y: 30,
            },
            marginOffsetBottomRight: {
              x: 100,
              y: 100,
            },
          }}
          transformButtonsRenderer={() => undefined}
          onEdgesTargetChanged={undefined}
        />
      </div>
    );
  }

  private computeGraphElements(items: DirectedGraphItem[]) {
    return {
      nodes: this.getGraphNodes(items),
      edges: this.getGraphEdges(items),
    };
  }

  private getGraphNodes(items: DirectedGraphItem[]): Array<GraphNode<DirectedGraphItem>> {
    return items.map(
      (item): GraphNode<DirectedGraphItem> => {
        return {
          id: item.id,
          renderer: Node(item.contentRenderer),
          footerRenderer: item.footerRenderer,
          miniRenderer: Node(item.contentRenderer),
          contentProps: {
            nodeId: item.id,
            data: {
              ...item,
              onClick: item.onClick || EMPTY_ONCLICK_EVENT,
            },
          },
        };
      }
    );
  }

  private getGraphEdges(items: DirectedGraphItem[]): GraphEdge[] {
    const edges: GraphEdge[] = [];

    for (const item of items) {
      for (const neighborId of item.neighborIds) {
        edges.push({
          sourceNodeId: item.id,
          targetNodeId: neighborId,
          localEdgeId: 'local',
        });
      }
    }
    return edges;
  }
}
