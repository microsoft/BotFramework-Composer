import * as Dagre from 'dagre';
import * as React from 'react';

import * as Constants from './Constants';
import { Edge, EdgeProps } from './Edge';
import { EdgeTracer } from './EdgeTracer';
import './Graph.scss';
import {
  BoundingBox,
  Coord2d,
  EdgeDragData,
  EdgeDropData,
  EdgeTargetChangedData,
  GraphEdge,
  GraphFlexDirection,
  LayoutNode,
  NodeSize,
  StringMap,
} from './GraphSchemas';
import { GraphNode, NodeProps, NodeRenderer } from './Node';
import { NodeContentProps } from './NodeContent';
import * as SimpleFlex from './SimpleFlex';
import { TransformableView, TransformButtonsRenderer } from './TransformableView';
import * as Utils from './Utils';

export interface GraphOptions extends SimpleFlex.LayoutOptions {
  marginOffsetBottomRight: Coord2d;
}

export interface GraphProps<TData> {
  nodeList: GraphNode<TData>[];
  edgeList: GraphEdge[];
  graphOptions: GraphOptions;
  transformButtonsRenderer: TransformButtonsRenderer;
  onEdgesTargetChanged: (changeInstances: EdgeTargetChangedData[]) => void;
}

export interface GraphState {
  edgeDragData: EdgeDragData;
  transformScale: number;
}

export class Graph<TData> extends React.Component<GraphProps<TData>, GraphState> {
  private isEntireGraphMounted: boolean = false;
  private layoutGraph: Dagre.graphlib.Graph;
  private anchorMap: StringMap<StringMap<Coord2d>>;
  private dropReceiverId: string = '';
  private flexDirection: GraphFlexDirection;
  private prevNodeList: GraphNode<TData>[];
  private allNodesBoundingBox: BoundingBox;
  private nodeRefs: StringMap<NodeRenderer> = {};
  private transformableViewRef: React.RefObject<TransformableView> = React.createRef();

  constructor(props: GraphProps<TData>) {
    super(props);

    const layoutGraph = new Dagre.graphlib.Graph({
      multigraph: true,
    });

    this.flexDirection = 'Vertical';

    layoutGraph.setGraph({
      ranker: 'network-simplex',
      rankdir: 'TB',
      align: 'UL',
      marginx: 0,
      marginy: 0,
      ranksep: Constants.graphRankSeparation,
      nodesep: Constants.graphNodeSeparation,
    });

    layoutGraph.setDefaultEdgeLabel(() => ({}));

    const anchorMap: StringMap<StringMap<Coord2d>> = {};

    this.props.nodeList.forEach(node => {
      anchorMap[node.id] = {};
    });

    this.state = {
      edgeDragData: null,
      transformScale: 1,
    };

    this.layoutGraph = layoutGraph;
    this.anchorMap = anchorMap;
  }

  public componentDidMount(): void {
    this.layout();
    this.forceUpdate();
    this.isEntireGraphMounted = true;
  }

  public componentDidUpdate(): void {
    if (this.transformableViewRef.current) {
      this.transformableViewRef.current.refreshViewAndMiniMap();
    }
  }

  public render(): React.ReactNode {
    const graphNodes = this.toDictionary(this.props.nodeList);
    this.populateLayoutGraph(graphNodes, this.layoutGraph, this.anchorMap);

    if (this.prevNodeList !== this.props.nodeList) {
      // NOTE(lin): If the input nodeList doesn't change, the node & edge relationship is not changed.
      // So recompute layout here only if the render is triggered by a change in nodeList, as opposed to e.g. dragging edges around.
      this.layout();
      this.prevNodeList = this.props.nodeList;
    }

    const nodePropsMap = this.getNodePropsMap(graphNodes, this.props.edgeList, this.layoutGraph);
    const edgePropsMap = this.getEdgePropsMap(this.props.edgeList, nodePropsMap, this.anchorMap);

    return (
      <div className="graph" onMouseMove={this.onMouseMove} onDragOver={this.onDragOver} onDrop={this.onDrop}>
        <TransformableView
          ref={this.transformableViewRef}
          isEnabled={true}
          transformButtonsRenderer={this.props.transformButtonsRenderer}
          miniMapContent={this.renderMiniMapContent(nodePropsMap)}
          onScaleChanged={this.onScaleChanged}
        >
          {this.renderBoundaryCorner()}
          {this.renderNodes(nodePropsMap)}
          {this.renderEdgeDragTracer()}
          {this.renderEdges(edgePropsMap)}
        </TransformableView>
      </div>
    );
  }

  public scrollNodeIntoView = (nodeId: string): void => {
    if (this.transformableViewRef && this.transformableViewRef.current) {
      const node = this.getNodeProps(nodeId, this.layoutGraph);

      if (node) {
        this.transformableViewRef.current.scrollPointIntoView({
          x: node.x * this.state.transformScale,
          y: node.y * this.state.transformScale,
        });
      }
    }
  };

  public updateFlexDirection(flexDirection: GraphFlexDirection): void {
    this.flexDirection = flexDirection;

    const graphConfig = this.layoutGraph.graph();
    this.layoutGraph.setGraph({
      ...graphConfig,
      rankdir: flexDirection === 'Horizontal' ? 'LR' : 'TB',
    });

    this.layout();

    this.forceUpdate();
  }

  private renderBoundaryCorner(): React.ReactNode {
    if (!this.allNodesBoundingBox) {
      return;
    }

    const { bottomRight } = this.allNodesBoundingBox;
    const { marginOffsetBottomRight } = this.props.graphOptions;

    return (
      <div
        className="boundary-corner"
        style={{
          left: bottomRight.x + marginOffsetBottomRight.x,
          top: bottomRight.y + marginOffsetBottomRight.y,
        }}
      />
    );
  }

  private renderMiniMapContent(nodePropsMap: StringMap<NodeProps<TData>>): React.ReactNode {
    return this.renderMiniNodes(nodePropsMap);
  }

  private renderEdges(edgePropsMap: StringMap<EdgeProps<TData>>): JSX.Element[] {
    return Object.keys(edgePropsMap).map(id => {
      const edgeProps = edgePropsMap[id];

      return (
        <Edge
          key={edgeProps.id}
          {...edgeProps}
          anchorPoint={this.anchorMap[edgeProps.sourceNodeProps.id][edgeProps.localEdgeId]}
          flexDirection={this.flexDirection}
          dragData={this.state.edgeDragData}
        />
      );
    });
  }

  private renderEdgeDragTracer(): JSX.Element {
    const { edgeDragData } = this.state;

    if (!edgeDragData) {
      return null;
    }

    const id = edgeDragData.edgeId + '_DragTracer';
    return <EdgeTracer id={id} dragData={this.state.edgeDragData} transformScale={this.state.transformScale} />;
  }

  private renderNodes(nodePropsMap: StringMap<NodeProps<TData>>): JSX.Element[] {
    return Object.keys(nodePropsMap).map(nodeId => {
      const nodeProps = nodePropsMap[nodeId];

      if (!nodeProps.renderer) {
        throw new Error(`Node '${nodeProps.id}' does not have a renderer component.`);
      }

      return (
        <nodeProps.renderer
          key={nodeProps.id}
          ref={c => (this.nodeRefs[nodeProps.id] = (c as any) as NodeRenderer)}
          {...nodeProps}
          flexDirection={this.flexDirection}
          dragData={this.state.edgeDragData}
          onNodeResized={this.onNodeResized}
          onAnchorsChanged={this.onEdgeAnchorsChanged}
          onAttractorDropZoneReceive={this.onAttractorDropZoneReceive}
          onScrollIntoView={this.scrollNodeIntoView}
          getSortedIncomingEdgeIds={this.getSortedIncomingEdgeIds}
        />
      );
    });
  }

  private renderMiniNodes(nodePropsMap: StringMap<NodeProps<TData>>): JSX.Element[] {
    return Object.keys(nodePropsMap).map(nodeId => {
      const nodeProps = nodePropsMap[nodeId];

      if (!nodeProps.miniRenderer) {
        throw new Error(`Node '${nodeProps.id}' does not have a mini-renderer component.`);
      }

      const contentProps: NodeContentProps<TData> = {
        ...nodeProps.contentProps,
        miniNodeContentProps: {
          nodeWidth: nodeProps.width,
          nodeHeight: nodeProps.height,
        },
      };

      return (
        <nodeProps.miniRenderer
          key={nodeProps.id}
          {...nodeProps}
          footerRenderer={null}
          contentProps={contentProps}
          flexDirection={this.flexDirection}
        />
      );
    });
  }

  private layout(): void {
    this.allNodesBoundingBox = SimpleFlex.layout(this.layoutGraph, this.props.graphOptions);
  }

  private toDictionary(nodeList: GraphNode<TData>[]): StringMap<GraphNode<TData>> {
    const dict: StringMap<GraphNode<TData>> = {};
    nodeList.forEach(node => (dict[node.id] = node));
    return dict;
  }

  private populateLayoutGraph(
    nodeMap: StringMap<GraphNode<TData>>,
    layoutGraph: Dagre.graphlib.Graph,
    anchorMap: StringMap<StringMap<Coord2d>>
  ): void {
    const layoutNodes = this.getAllNodes(layoutGraph);
    const layoutNodeMap = this.toDictionary(layoutNodes);

    this.clearGraph(layoutGraph);

    const nodeIds = Object.keys(nodeMap);
    for (const id of nodeIds) {
      const layoutNode: GraphNode<TData> | LayoutNode = layoutNodeMap[id] || {
        id,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };

      layoutGraph.setNode(id, layoutNode);

      anchorMap[id] = anchorMap[id] || {};
    }

    for (const edge of this.props.edgeList) {
      layoutGraph.setEdge({
        v: edge.sourceNodeId,
        w: edge.targetNodeId,
        name: edge.localEdgeId,
      });
    }
  }

  private getNodePropsMap(
    nodeMap: StringMap<GraphNode<TData>>,
    edges: GraphEdge[],
    layoutGraph: Dagre.graphlib.Graph
  ): StringMap<NodeProps<TData>> {
    const nodePropsMap: StringMap<NodeProps<TData>> = {};
    const edgeGroupMap: StringMap<GraphEdge[]> = {};

    for (const edge of edges) {
      const group = edgeGroupMap[edge.sourceNodeId] || [];
      group.push(edge);
      edgeGroupMap[edge.sourceNodeId] = group;
    }

    Object.keys(nodeMap).forEach(nodeId => {
      nodePropsMap[nodeId] = {
        flexDirection: undefined,
        ...nodeMap[nodeId],
        ...layoutGraph.node(nodeId),
        outgoingEdges: edgeGroupMap[nodeId] || [],
      };
    });

    return nodePropsMap;
  }

  private getEdgePropsMap(
    graphEdges: GraphEdge[],
    nodePropsMap: StringMap<NodeProps<TData>>,
    anchorMap: StringMap<StringMap<Coord2d>>
  ): StringMap<EdgeProps<TData>> {
    const edgePropsMap: StringMap<EdgeProps<TData>> = {};

    for (const edge of graphEdges) {
      const { sourceNodeId, targetNodeId, localEdgeId, options } = edge;
      const sourceNode = nodePropsMap[sourceNodeId];
      const targetNode = nodePropsMap[targetNodeId];
      const globalEdgeId = Utils.getGlobalEdgeId(sourceNodeId, targetNodeId, localEdgeId);

      const edgeProps: EdgeProps<TData> = {
        id: globalEdgeId,
        localEdgeId,
        sourceNodeProps: sourceNode,
        targetNodeProps: targetNode,
        options,
        anchorPoint: anchorMap[sourceNodeId] && anchorMap[sourceNodeId][localEdgeId],
        flexDirection: this.flexDirection,
        shouldDisableDroppingIncomingEdges: targetNode.shouldDisableDroppingIncomingEdges,
        getSortedIncomingEdgeIds: this.getSortedIncomingEdgeIds,
        onDragStart: this.onEdgeDragStart,
        onAnchorReceive: this.onAnchorDropZoneReceive,
        onReceptorReceive: this.onAttractorDropZoneReceive,
      };

      edgePropsMap[edgeProps.id] = edgeProps;
    }

    return edgePropsMap;
  }

  private clearGraph(layoutGraph: Dagre.graphlib.Graph): void {
    // NOTE(lin): Dagre internally removes connected edges when a node is removed,
    // so we don't need to invoke removeEdge separately.
    const nodeIds = layoutGraph.nodes();
    for (const id of nodeIds) {
      layoutGraph.removeNode(id);
    }
  }

  private onMouseMove = (event: React.MouseEvent<Element>): void => {
    // NOTE(lin): Occasionally the edge tracer might get stuck in a visible state even after dropping it,
    // e.g. if the drop happens outside of the graph. Here we ensure it's hidden.
    if (this.state.edgeDragData) {
      this.setState({
        edgeDragData: null,
      });
    }
  };

  private onDragOver = (event: React.DragEvent<Element>): void => {
    event.preventDefault();

    const { edgeDragData } = this.state;
    if (edgeDragData) {
      edgeDragData.currentPosition = {
        x: event.pageX,
        y: event.pageY,
      };

      this.setState({
        edgeDragData,
      });
    }
  };

  private onDrop = (event: React.DragEvent<Element>): void => {
    const { edgeDragData } = this.state;

    if (edgeDragData && !this.dropReceiverId) {
      // NOTE(lin): No drop zones receive this drop-off, i.e. the edge is dropped on the background. Remove the edge.
      const { sourceNodeId, localEdgeId } = edgeDragData;

      this.props.onEdgesTargetChanged([
        {
          sourceNodeId,
          localEdgeId,
          newTargetNodeId: undefined,
        },
      ]);
    }

    this.dropReceiverId = '';

    this.setState({
      edgeDragData: null,
    });
  };

  private onNodeResized = (nodeId: string, newSize: NodeSize): void => {
    const nodeProps = this.layoutGraph.node(nodeId);
    nodeProps.width = newSize.width;
    nodeProps.height = newSize.height;

    this.layoutGraph.setNode(nodeId, nodeProps);

    if (this.isEntireGraphMounted) {
      this.layout();
    }

    this.forceUpdate();
  };

  private onEdgeDragStart = (edgeDragData: EdgeDragData): void => {
    this.setState({
      edgeDragData,
    });
  };

  private onAnchorDropZoneReceive = (edgeDropData: EdgeDropData): void => {
    const { edgeDragData } = this.state;

    this.dropReceiverId = edgeDragData.sourceNodeId;

    if (edgeDragData.edgeId !== edgeDropData.edgeId) {
      const { sourceNodeId: prevSourceNodeId, localEdgeId: prevLocalEdgeId, targetNodeId } = edgeDragData;
      const { receivingNodeId, receivingLocalEdgeId } = edgeDropData;

      this.props.onEdgesTargetChanged([
        {
          sourceNodeId: prevSourceNodeId,
          localEdgeId: prevLocalEdgeId,
          newTargetNodeId: undefined,
        },
        {
          sourceNodeId: receivingNodeId,
          localEdgeId: receivingLocalEdgeId,
          newTargetNodeId: targetNodeId,
        },
      ]);
    }
  };

  private onAttractorDropZoneReceive = (edgeDropData: EdgeDropData): void => {
    const { edgeDragData } = this.state;

    this.dropReceiverId = edgeDragData.sourceNodeId;

    if (edgeDragData.targetNodeId !== edgeDropData.receivingNodeId) {
      const { sourceNodeId, localEdgeId } = edgeDragData;
      const { receivingNodeId } = edgeDropData;

      this.props.onEdgesTargetChanged([
        {
          sourceNodeId,
          localEdgeId,
          newTargetNodeId: receivingNodeId,
        },
      ]);
    }
  };

  private onEdgeAnchorsChanged = (nodeId: string, anchors: StringMap<Coord2d>): void => {
    const prevAnchors = this.anchorMap[nodeId];
    const isChanged =
      anchors &&
      Object.keys(anchors).some(edgeLocalId => {
        const anchor = anchors[edgeLocalId];
        const prevAnchor = prevAnchors[edgeLocalId];
        return !!(
          (!anchor && prevAnchor) ||
          (anchor && !prevAnchor) ||
          (anchor && prevAnchor && (anchor.x !== prevAnchor.x || anchor.y !== prevAnchor.y))
        );
      });

    if (isChanged) {
      this.anchorMap[nodeId] = anchors;

      this.forceUpdate();
    }
  };

  private onScaleChanged = (transformScale: number): void => {
    this.setState({
      transformScale,
    });
  };

  private getNodeProps = (nodeId: string, layoutGraph?: Dagre.graphlib.Graph): NodeProps<TData> | undefined => {
    if (!nodeId) {
      return undefined;
    }

    if (!layoutGraph) {
      layoutGraph = this.layoutGraph;
    }

    return layoutGraph.node(nodeId) as NodeProps<TData>;
  };

  private getAllNodes(layoutGraph: Dagre.graphlib.Graph): NodeProps<TData>[] {
    return layoutGraph.nodes().map(id => this.getNodeProps(id));
  }

  private getSortedIncomingEdgeIds = (nodeId: string): string[] => {
    const incomingEdges = this.layoutGraph.inEdges(nodeId);
    this.sortEdges(incomingEdges);
    return incomingEdges.map(e => Utils.getGlobalEdgeId(e.v, e.w, e.name));
  };

  private sortEdges(edges: Dagre.Edge[]): void {
    edges.sort((e0, e1) => {
      const source0 = this.layoutGraph.node(e0.v);
      const source1 = this.layoutGraph.node(e1.v);
      const anchor0 = this.anchorMap[e0.v][e0.name];
      const anchor1 = this.anchorMap[e1.v][e1.name];

      if (this.flexDirection === 'Vertical') {
        // NOTE(lin): Sort edges left to right.
        const x0 = anchor0 ? anchor0.x : source0.x;
        const x1 = anchor1 ? anchor1.x : source1.x;
        return x0 - x1;
      } else {
        // NOTE(lin): Sort edges bottom to top.
        const y0 = anchor0 ? anchor0.y : source0.y;
        const y1 = anchor1 ? anchor1.y : source1.y;
        return y1 - y0;
      }
    });
  }
}
