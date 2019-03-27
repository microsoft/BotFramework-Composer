import { FluentCustomizations } from '@uifabric/fluent-theme';
import { Customizer } from 'office-ui-fabric-react';
import * as React from 'react';

import * as Utils from '../common/util';

import * as Constants from './Constants';
import {
  Coord2d,
  EdgeDragData,
  EdgeDropData,
  GraphEdge,
  GraphFlexDirection,
  LayoutNode,
  NodeSize,
  StringMap,
} from './GraphSchemas';
import { AnchorPointResult, NodeContent, NodeContentProps } from './NodeContent';

export interface GraphNode<TData> {
  id: string;
  renderer: React.ComponentClass<NodeProps<TData>>;
  miniRenderer: React.ComponentClass<NodeProps<TData>>;
  footerRenderer?: React.ComponentClass<NodeContentProps<TData>>;
  contentProps: NodeContentProps<TData>;
  shouldDisableDroppingIncomingEdges?: boolean;
}

export interface NodeProps<TData> extends GraphNode<TData>, LayoutNode {
  outgoingEdges: GraphEdge[];
  flexDirection: GraphFlexDirection;
  dragData?: EdgeDragData;
  onNodeResized?: (nodeId: string, newSize: NodeSize) => void;
  onClick?: (event: React.MouseEvent<Element>, nodeId: string) => void;
  onAnchorsChanged?: (nodeId: string, anchors: StringMap<Coord2d>) => void;
  onAttractorDropZoneReceive?: (dragData: EdgeDropData) => void;
  onScrollIntoView?: (nodeId: string) => void;
  getSortedIncomingEdgeIds?: (nodeId: string) => string[];
}

type VanillaContentComponentType<TData> = React.ComponentClass<NodeContentProps<TData>>;
type ContainerContentComponentType<TData> = React.ComponentClass<NodeContentProps<TData>> & {
  getWrappedInstance: () => VanillaContentComponentType<TData>;
};
type ContentComponentType<TData> = VanillaContentComponentType<TData> | ContainerContentComponentType<TData>;

export interface NodeRenderer {
  scrollIntoView(): void;
}

const DEFAULT_ANCHORPOINT = 'NodeDefault';

// NOTE(lin): "Node" is an HOC (higher order component) that wraps around a "node content component".
// The Node HOC provides common node related utilities in a graph context, such as positioning and edge routing.
// In contrast, the content component concerns the business presentation and logic.
export function Node<TData>(ContentComponent: ContentComponentType<TData>): React.ComponentClass<NodeProps<TData>> {
  return class extends React.Component<NodeProps<TData>> implements NodeRenderer {
    public static readonly displayName = 'Node';

    private hasBeenLaidOut: boolean = false;
    private contentRef: React.RefObject<NodeContent<TData>> = React.createRef();
    private selfRef: React.RefObject<HTMLDivElement> = React.createRef();

    public scrollIntoView = (): void => {
      this.props.onScrollIntoView(this.props.contentProps.nodeId);
    };

    public componentDidMount(): void {
      this.reportNodeSize();
    }

    public componentDidUpdate(prevProps: NodeProps<TData>): void {
      if (prevProps.x !== this.props.x || prevProps.y !== this.props.y) {
        this.afterContentRender();
        this.hasBeenLaidOut = true;
      }
    }

    public render(): React.ReactNode {
      const animatedClass = this.hasBeenLaidOut ? 'animated' : '';

      return (
        <Customizer {...FluentCustomizations}>
          <div
            ref={this.selfRef}
            className={`node ${animatedClass}`}
            style={this.getNodeSpatialStyle()}
            onClick={event => this.props.onClick && this.props.onClick(event, this.props.id)}
          >
            {this.renderNodeId()}
            {this.renderContent()}
            {this.renderFooterBox()}
            {this.renderAttractorDropZone()}
            {this.renderAttractor()}
          </div>
        </Customizer>
      );
    }

    private renderNodeId(): string {
      return Utils.isDebugMode() ? this.props.id : null;
    }

    private renderContent(): React.ReactNode {
      return (
        <ContentComponent
          ref={this.contentRef}
          {...this.getContentProps()}
          afterRender={this.afterContentRender}
          scrollIntoView={this.scrollIntoView}
        />
      );
    }

    private renderFooterBox(): React.ReactNode {
      return <div className="footer-box">{this.renderFooter()}</div>;
    }

    private renderFooter(): React.ReactNode {
      if (!this.props.footerRenderer) {
        return null;
      }

      const contentProps = this.getContentProps();

      return <this.props.footerRenderer data={contentProps.data} nodeId={contentProps.nodeId} />;
    }

    private renderAttractorDropZone(): React.ReactNode {
      if (!this.canReceiveReceptor()) {
        return null;
      }

      const r = Constants.edgeAnchorRadius * 3;
      const isVertical = this.props.flexDirection === 'Vertical';
      const x = isVertical ? this.props.width / 2 : 0;
      const y = isVertical ? 0 : this.props.height / 2;

      return (
        <div
          className="attractor-drop-zone"
          style={{
            borderRadius: r,
            width: r * 2,
            height: r * 2,
            left: x - r - 1,
            top: y - r - 1,
          }}
          onDrop={event => this.onAttractorDropzoneReceive(event)}
        />
      );
    }

    private renderAttractor(): React.ReactNode {
      if (!this.props.getSortedIncomingEdgeIds || this.props.getSortedIncomingEdgeIds(this.props.id).length < 2) {
        return null;
      }

      const r = Constants.edgeAttractorRadius;
      const backgroundFillColor = this.canReceiveReceptor() ? 'rgba(221,160,221,0.5)' : 'white';
      const centerFillColor = this.canReceiveReceptor() ? 'plum' : '#f0f0f0';

      return (
        <svg className="attractor" style={this.getAttractorSpaitalStyle()} xmlns="http://www.w3.org/2000/svg">
          <circle className="attractor" cx={r - 1} cy={r - 1} stroke="gray" fill={backgroundFillColor} r={r} />
          <circle className="attractor" cx={r - 1} cy={r - 1} stroke="gray" fill={centerFillColor} r={r / 2} />
        </svg>
      );
    }

    private getContentProps(): NodeContentProps<TData> {
      const { contentProps, id, flexDirection } = this.props;

      return {
        ...contentProps,
        nodeId: id,
        flexDirection,
      };
    }

    private canReceiveReceptor(): boolean {
      return (
        this.props.dragData &&
        this.props.dragData.dragTargetType === 'Receptor' &&
        !this.props.shouldDisableDroppingIncomingEdges
      );
    }

    private getEdgeAnchorPoint = (edge: GraphEdge): Coord2d | undefined => {
      if (!this.contentRef.current) {
        return undefined;
      }

      const isVertical = this.props.flexDirection === 'Vertical';

      // NOTE(lin): contentRef could point to a vanilla React component, or a Redux container component.
      // In the latter case, we need to extract the wrapped content component before invoking imperative APIs.
      const contentComponent: NodeContent<any> = (this.contentRef.current as any).getWrappedInstance
        ? (this.contentRef.current as any).getWrappedInstance()
        : this.contentRef.current;

      let anchorPoint = contentComponent.getEdgeAnchorPoint
        ? (contentComponent.getEdgeAnchorPoint(edge) as AnchorPointResult)
        : DEFAULT_ANCHORPOINT;

      if (anchorPoint === DEFAULT_ANCHORPOINT) {
        const x = isVertical ? this.props.x : this.props.x + this.props.width / 2;
        const y = isVertical ? this.props.y + this.props.height / 2 : this.props.y;
        anchorPoint = {
          x,
          y,
        };
      } else {
        const self = this.selfRef.current;
        const rect = self.getBoundingClientRect();
        const selfCoords = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        const dx = anchorPoint.x - selfCoords.x;
        const dy = anchorPoint.y - selfCoords.y;

        anchorPoint = isVertical
          ? {
              x: this.props.x + dx,
              y: this.props.y + this.props.height / 2,
            }
          : {
              x: this.props.x + this.props.width / 2,
              y: this.props.y + dy,
            };
      }
      return anchorPoint as Coord2d;
    };

    private reportNodeSize(): void {
      if (!this.selfRef.current || !this.props.onNodeResized) {
        return;
      }

      const nodeSize = {
        width: this.selfRef.current.offsetWidth,
        height: this.selfRef.current.offsetHeight,
      };

      // NOTE(lin): Use threshold instead of exact comparison to ignore slight size changes,
      // e.g. due to border boldening or highlighting.
      const threshold = 10;
      const isSignificant =
        Math.abs(nodeSize.width - this.props.width) > threshold ||
        Math.abs(nodeSize.height - this.props.height) > threshold;

      if (isSignificant) {
        this.props.onNodeResized(this.props.id, nodeSize);
      }
    }

    private getNodeSpatialStyle(): React.CSSProperties {
      return {
        left: this.props.x - this.props.width / 2,
        top: this.props.y - this.props.height / 2,
      };
    }

    private getAttractorSpaitalStyle(): React.CSSProperties {
      const isVertical = this.props.flexDirection === 'Vertical';
      const left = isVertical ? this.props.width / 2 - Constants.edgeAttractorRadius : -Constants.edgeAttractorRadius;
      const top = isVertical ? -Constants.edgeAttractorRadius : this.props.height / 2 - Constants.edgeAttractorRadius;

      return {
        left,
        top,
        width: Constants.edgeAttractorRadius * 2,
        height: Constants.edgeAttractorRadius * 2,
      };
    }

    private afterContentRender = () => {
      this.reportNodeSize();

      if (this.props.onAnchorsChanged) {
        const anchors: StringMap<Coord2d> = {};

        for (const edge of this.props.outgoingEdges) {
          anchors[edge.localEdgeId] = this.getEdgeAnchorPoint(edge);
        }

        this.props.onAnchorsChanged(this.props.id, anchors);
      }
    };

    private onAttractorDropzoneReceive = (event: React.DragEvent<Element>): void => {
      if (this.props.onAttractorDropZoneReceive) {
        this.props.onAttractorDropZoneReceive({
          edgeId: this.props.dragData.edgeId,
          receivingNodeId: this.props.id,
          receivingLocalEdgeId: undefined,
          dropTargetType: 'Receptor',
        });
      }
    };
  };
}
