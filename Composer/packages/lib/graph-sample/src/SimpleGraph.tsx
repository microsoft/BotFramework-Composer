import * as React from "react";
import { Graph } from "./graph/Graph";
import { GraphEdge } from "./graph/GraphSchemas";
import { GraphNode } from "./graph/Node";
import "./SimpleGraph.scss";
import { Color, ItemRenderer, SimpleItem } from "./SimpleItem";

interface SimpleGraphState {
    items: SimpleItem[];
}

export class SimpleGraph extends React.Component<{}, SimpleGraphState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            items: [],
        };
    }

    public componentDidMount(): void {
        const items = loadItems();
        for (const item of items) {
            item.onClick = this.onClick;
        }

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
                        nodeAlignmentStyle: "Symmetric",
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
        const index = items.findIndex((item) => item.id === id);
        const item = items[index];
        const color = item.value;
        const nextColor =
            color === Color.Red
                ? Color.Green
                : color === Color.Green
                    ? Color.Blue
                    : Color.Red;

        const updatedItem = {
            ...item,
            value: nextColor,
        };

        const updatedItems = [...items.slice(0, index), updatedItem, ...items.slice(index + 1)];
        this.setState({
            items: updatedItems,
        });
    }

    private getGraphNodes(items: SimpleItem[]): Array<GraphNode<SimpleItem>> {
        return items.map((item): GraphNode<SimpleItem> => {
            return {
                id: item.id,
                renderer: ItemRenderer,
                miniRenderer: ItemRenderer,
                contentProps: {
                    nodeId: item.id,
                    data: item,
                },
            };
        });
    }

    private getGraphEdges(items: SimpleItem[]): GraphEdge[] {
        const edges: GraphEdge[] = [];

        for (const item of items) {
            for (const neighborId of item.neighborIds) {
                edges.push({
                    sourceNodeId: item.id,
                    targetNodeId: neighborId,
                    localEdgeId: "local",
                });
            }
        }

        return edges;
    }
}

function loadItems(): SimpleItem[] {
    return [
        {
            id: "node_0",
            value: Color.Green,
            neighborIds: ["node_1", "node_2"],
        },
        {
            id: "node_1",
            value: Color.Red,
            neighborIds: ["node_4"],
        },
        {
            id: "node_2",
            value: Color.Blue,
            neighborIds: ["node_3"],
        },
        {
            id: "node_3",
            value: Color.Green,
            neighborIds: ["node_4"],
        },
        {
            id: "node_4",
            value: Color.Blue,
            neighborIds: [],
        },
    ];
}
