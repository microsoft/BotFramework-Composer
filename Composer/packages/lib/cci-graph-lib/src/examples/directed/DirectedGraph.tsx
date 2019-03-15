import * as React from 'react';
import { Graph } from '../../graph/Graph';
import { GraphEdge } from '../../graph/GraphSchemas';
import { GraphNode, Node } from '../../graph/Node';
import './DirectedGraph.scss';
import { DirectedGraphItem } from './DirectedGraphItem';

interface DirectedGraphState {
  items: DirectedGraphItem[];
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

  constructor(props: any) {
    super(props);

    this.state = {
      items: [],
    };
  }

  public componentDidMount(): void {
    const items = this.props.items;
    this.setState({
      items,
    });
  }

  public render(): React.ReactNode {
    const nodes = this.getGraphNodes(this.state.items);
    const edges = this.getGraphEdges(this.state.items);

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
