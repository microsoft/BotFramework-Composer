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

// TODO: extract node transformer.
function getGraphNodes(items: DirectedGraphItem[]): Array<GraphNode<DirectedGraphItem>> {
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

function getGraphEdges(items: DirectedGraphItem[]): GraphEdge[] {
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

  static getDerivedStateFromProps(props, state) {
    if (props.items !== state.prevItems) {
      return {
        nodes: getGraphNodes(props.items),
        edges: getGraphEdges(props.items),
      };
    }
  }

  public render(): React.ReactNode {
    const { nodes, edges } = this.state;
    return (
      <div className="graph-container" style={{ width: this.props.width, height: this.props.height }}>
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
}
