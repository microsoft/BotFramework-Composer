import * as React from 'react';
import { Graph } from '../../graph/Graph';
import { GraphEdge } from '../../graph/GraphSchemas';
import { GraphNode, Node } from '../../graph/Node';
import './SimpleGraph.scss';
import { Color, DirectedGraphItem } from './SimpleItem';

interface SimpleGraphState {
  items: DirectedGraphItem[];
}

interface GraphPropsType {
  items: DirectedGraphItem[];
  width: number;
  height: number;
}

export class SimpleGraph extends React.Component<GraphPropsType, SimpleGraphState> {
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

  private onClick = (id: string): void => {
    const { items } = this.state;
    const index = items.findIndex(item => item.id === id);
    const item = items[index];
    const color = item.value;
    const nextColor = color === Color.Red ? Color.Green : color === Color.Green ? Color.Blue : Color.Red;

    const updatedItem = {
      ...item,
      value: nextColor,
    };

    const updatedItems = [...items.slice(0, index), updatedItem, ...items.slice(index + 1)];
    this.setState({
      items: updatedItems,
    });
  };

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
              onClick: this.onClick,
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
