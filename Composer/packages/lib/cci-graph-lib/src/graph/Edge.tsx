import * as React from 'react';
import * as Utils from '../common/util';
import * as Constants from './Constants';
import {
  Coord2d,
  EdgeDragAndDropTargetType,
  EdgeDragData,
  EdgeDropData,
  EdgeOptions,
  GraphFlexDirection,
} from './GraphSchemas';
import { NodeProps } from './Node';
import * as GraphUtils from './Utils';

export interface EdgeProps<TData> {
  id: string;
  localEdgeId: string;
  sourceNodeProps: NodeProps<TData>;
  targetNodeProps: NodeProps<TData> | undefined;
  options?: EdgeOptions;
  anchorPoint?: Coord2d | undefined;
  flexDirection: GraphFlexDirection;
  dragData?: EdgeDragData | undefined;
  shouldDisableDroppingIncomingEdges?: boolean | undefined;
  getSortedIncomingEdgeIds: (nodeId: string) => string[];
  onDragStart: (dragData: EdgeDragData) => void;
  onAnchorReceive: (dropData: EdgeDropData) => void;
  onReceptorReceive: (dropData: EdgeDropData) => void;
}

interface EdgeState {
  isFadingIn: boolean;
}

export class Edge<TData> extends React.Component<EdgeProps<TData>, EdgeState> {
  private prevAnchorPoint: Coord2d = null;
  private prevReceptorPoint: Coord2d = null;

  constructor(props: EdgeProps<TData>) {
    super(props);

    this.state = {
      isFadingIn: false,
    };
  }

  public componentDidUpdate(): void {
    const currentAnchorPoint = this.getAnchorPoint();
    const currentReceptorPoint = this.getReceptorPoint();

    const isRepositioned =
      this.prevAnchorPoint &&
      this.prevReceptorPoint &&
      GraphUtils.notEquals(this.prevAnchorPoint, currentAnchorPoint) &&
      GraphUtils.notEquals(this.prevReceptorPoint, currentReceptorPoint);

    if (isRepositioned) {
      this.setState({
        isFadingIn: true,
      });
    }

    this.prevAnchorPoint = currentAnchorPoint;
    this.prevReceptorPoint = currentReceptorPoint;
  }

  public render(): React.ReactNode {
    if (!this.props.anchorPoint) {
      return null;
    }

    const receptorPoint = this.getReceptorPoint();
    const animatedClassName = this.state.isFadingIn ? 'fade-in-animated' : '';

    const isBeingDragged = this.props.dragData && this.props.dragData.edgeId === this.props.id;
    const virtualClassName = isBeingDragged ? 'virtual' : '';
    const customPathClass = (this.props.options && this.props.options.customPathClassName) || '';

    return (
      <div className="edge">
        <svg className="paths" xmlns="http://www.w3.org/2000/svg">
          {this.renderAnchorAttachmentStraightline(virtualClassName, animatedClassName, customPathClass)}
          {this.renderCubicBezierCurve(receptorPoint, virtualClassName, animatedClassName, customPathClass)}
          {this.renderAttractorPath(receptorPoint, animatedClassName, customPathClass)}
        </svg>
        {this.renderAnchorDropZone()}
        {this.renderAnchor()}
        {this.renderReceptor(receptorPoint)}
        {this.renderLocalEdgeId()}
      </div>
    );
  }

  private renderAnchorDropZone(): React.ReactNode {
    if (
      !this.props.dragData ||
      (this.props.dragData.dragTargetType !== 'Anchor' && this.props.dragData.edgeId !== this.props.id)
    ) {
      return null;
    }

    const anchorPoint = this.getAnchorPoint();
    const r = Constants.edgeAnchorRadius * 3;

    return (
      <div
        className="circle anchor-drop-zone"
        style={{
          width: r * 2,
          height: r * 2,
          left: anchorPoint.x - r,
          top: anchorPoint.y - r,
        }}
        onDrop={event => this.onAnchorReceive(event)}
      />
    );
  }

  private renderAnchor(): React.ReactNode {
    if (!this.props.options || !this.props.options.isAnchorVisible) {
      return null;
    }

    const anchorPoint = this.getAnchorPoint();
    const r = Constants.edgeAnchorRadius;
    const borderWidth = Constants.edgeAnchorBorderWidth;

    return (
      <div
        className="circle anchor draggable"
        draggable={true}
        style={{
          width: r * 2,
          height: r * 2,
          left: anchorPoint.x - r - borderWidth,
          top: anchorPoint.y - r - borderWidth,
          borderWidth,
        }}
        onDragStart={event => this.onDragStart(event, 'Anchor')}
        onDrop={event => this.onAnchorReceive(event)}
      />
    );
  }

  private renderReceptor(receptorPoint: Coord2d): React.ReactNode {
    if (!this.props.options || !this.props.options.isReceptorVisible) {
      return null;
    }

    const r = Constants.edgeAnchorRadius;
    const borderWidth = Constants.edgeAnchorBorderWidth;

    return (
      <div
        className={`circle receptor`}
        draggable={true}
        style={{
          width: r * 2,
          height: r * 2,
          left: receptorPoint.x - r - borderWidth,
          top: receptorPoint.y - r - borderWidth,
          borderWidth,
        }}
        onDragStart={event => this.onDragStart(event, 'Receptor')}
        onDrop={!this.props.shouldDisableDroppingIncomingEdges ? this.onReceptorReceive : undefined}
      />
    );
  }

  private renderAttractorPath(
    receptorPoint: Coord2d,
    animatedClassName: string,
    customPathClass: string
  ): React.ReactNode {
    const attractorCenter = this.getAttractorCenter();

    if (!receptorPoint || (receptorPoint.x === attractorCenter.x && receptorPoint.y === attractorCenter.y)) {
      return null;
    }

    const d = `M${receptorPoint.x} ${receptorPoint.y} L ${attractorCenter.x} ${attractorCenter.y}`;
    return this.renderCurve(d, '', animatedClassName, customPathClass);
  }

  private renderCurve(
    d: string,
    virtualClassName: string,
    animatedClassName: string,
    customPathClass: string
  ): React.ReactNode {
    return (
      <path
        className={`path ${virtualClassName} ${animatedClassName} ${customPathClass}`}
        d={d}
        onAnimationEnd={this.onAnimationEnd}
      />
    );
  }

  private renderAnchorAttachmentStraightline(
    virtualClassName: string,
    animatedClassName: string,
    customPathClass: string
  ): React.ReactNode {
    const lineLength = this.getAnchorAttachmentStraightlineLength();

    if (!lineLength) {
      return null;
    }

    const lineStart = this.getAnchorPoint();
    const lineEnd: Coord2d = {
      x: lineStart.x,
      y: lineStart.y + lineLength,
    };

    const d = `M${lineStart.x} ${lineStart.y} L ${lineEnd.x} ${lineEnd.y}`;
    return this.renderCurve(d, virtualClassName, animatedClassName, customPathClass);
  }

  private renderCubicBezierCurve(
    curveEnd: Coord2d,
    virtualClassName: string,
    animatedClassName: string,
    customPathClass: string
  ): React.ReactNode {
    const curveStart = this.getAnchorPoint();
    curveStart.y += this.getAnchorAttachmentStraightlineLength();

    const midPoint = {
      x: (curveStart.x + curveEnd.x) / 2,
      y: (curveStart.y + curveEnd.y) / 2,
    };

    const cp0 = this.getStartControlPoint(curveStart, curveEnd, midPoint);
    const cp1 = this.getEndControlPoint(curveStart, curveEnd, midPoint);

    const d = `M${curveStart.x} ${curveStart.y} C ${cp0.x} ${cp0.y} ${cp1.x} ${cp1.y} ${curveEnd.x} ${curveEnd.y}`;
    return this.renderCurve(d, virtualClassName, animatedClassName, customPathClass);
  }

  private renderLocalEdgeId(): React.ReactNode {
    if (!Utils.isDebugMode()) {
      return null;
    }

    const startPoint = this.getAnchorPoint();
    const endPoint = this.getReceptorPoint();

    const midPoint: Coord2d = {
      x: (startPoint.x + endPoint.x) * 0.5,
      y: (startPoint.y + endPoint.y) * 0.5,
    };

    return (
      <div
        className="edge-id"
        style={{
          left: midPoint.x,
          top: midPoint.y - 10,
        }}
      >
        {this.props.localEdgeId}
      </div>
    );
  }

  private getAnchorAttachmentStraightlineLength(): number {
    return (this.props.options && this.props.options && this.props.options.anchorAttachmentStraightlineLength) || 0;
  }

  private getAnchorPoint(): Coord2d {
    let anchorPoint = this.props.anchorPoint;

    // NOTE(lin): If no anchor point is provided, default to the middle-bottom of the start node.
    if (!anchorPoint) {
      const isVertical = this.props.flexDirection === 'Vertical';
      const startNode = this.props.sourceNodeProps;
      const x = isVertical ? startNode.x : startNode.x + startNode.width / 2;
      const y = isVertical ? startNode.y + startNode.height / 2 : startNode.y;

      anchorPoint = {
        x,
        y,
      };
    }

    return {
      ...anchorPoint,
    };
  }

  private getReceptorPoint(): Coord2d | undefined {
    const attractorCenter = this.getAttractorCenter();
    const incomingEdgeIds = this.props.getSortedIncomingEdgeIds(this.props.targetNodeProps.id);

    if (incomingEdgeIds.length < 2) {
      return attractorCenter;
    }

    // NOTE(lin): When there are two or more receptors above a node, they orbit the attractor.
    const index = incomingEdgeIds.findIndex(id => id === this.props.id);
    let angle = Math.PI - ((index + 1) * Math.PI) / (incomingEdgeIds.length + 1);

    if (this.props.flexDirection === 'Horizontal') {
      // NOTE(lin): Vertical flex uses the upper half circle as orbit space, and horizontal flow uses the half circle on the left.
      angle += Math.PI / 2;
    }

    const x = attractorCenter.x + Constants.edgeReceptorOrbitRadius * Math.cos(angle);
    const y = attractorCenter.y - Constants.edgeReceptorOrbitRadius * Math.sin(angle);

    return {
      x,
      y,
    };
  }

  private getAttractorCenter(): Coord2d | undefined {
    const endNode = this.props.targetNodeProps;
    const isVertical = this.props.flexDirection === 'Vertical';
    const x = isVertical ? endNode.x : endNode.x - endNode.width / 2;
    const y = isVertical ? endNode.y - endNode.height / 2 : endNode.y;

    return {
      x,
      y,
    };
  }

  private getStartControlPoint(curveStart: Coord2d, curveEnd: Coord2d, midPoint: Coord2d): Coord2d {
    return this.props.flexDirection === 'Vertical'
      ? this.getStartControlPointForVerticalFlex(curveStart, curveEnd, midPoint)
      : this.getStartControlPointForHorizontalFlex(curveStart, curveEnd, midPoint);
  }

  private getStartControlPointForHorizontalFlex(curveStart: Coord2d, curveEnd: Coord2d, midPoint: Coord2d): Coord2d {
    // NOTE(lin): If source node is left of the target node, the control point is right of the curve start, at the same level of the mid-point.
    // If the source node is right of the target node, e.g. due to a loop, just pick a point right to the curve start.
    const isTargetLeftOfSource = curveEnd.x < curveStart.x;
    const x = isTargetLeftOfSource ? curveStart.x + Constants.edgeControlPointOffset : midPoint.x;

    let y = curveStart.y;
    if (isTargetLeftOfSource && Math.abs(y - midPoint.y) < Constants.edgeFlippedPathMinOffset) {
      // NOTE(lin): Make sure the curve don't go left through the same path going right towards the control point.
      y -= Constants.edgeFlippedPathMinOffset;
    }

    return {
      x,
      y,
    };
  }

  private getStartControlPointForVerticalFlex(curveStart: Coord2d, curveEnd: Coord2d, midPoint: Coord2d): Coord2d {
    // NOTE(lin): If source node is above the target node, the control point is below the curve start, at the same level of the mid-point.
    // If the source node is below the target node, e.g. due to a loop, just pick a point right below the curve start.
    const isTargetAboveSource = curveEnd.y < curveStart.y;
    const y = isTargetAboveSource ? curveStart.y + Constants.edgeControlPointOffset : midPoint.y;

    let x = curveStart.x;
    if (isTargetAboveSource && Math.abs(x - midPoint.x) < Constants.edgeFlippedPathMinOffset) {
      // NOTE(lin): Make sure the curve don't go up through the same path going down towards the control point.
      x += Constants.edgeFlippedPathMinOffset;
    }

    return {
      x,
      y,
    };
  }

  private getEndControlPoint(curveStart: Coord2d, curveEnd: Coord2d, basePoint: Coord2d): Coord2d {
    return this.props.flexDirection === 'Vertical'
      ? this.getEndControlPointForVerticalFlex(curveStart, curveEnd, basePoint)
      : this.getEndControlPointForHorizontalFlex(curveStart, curveEnd, basePoint);
  }

  private getEndControlPointForHorizontalFlex(curveStart: Coord2d, curveEnd: Coord2d, basePoint: Coord2d): Coord2d {
    const isTargetLeftOfSource = curveEnd.x < curveStart.x;
    if (isTargetLeftOfSource) {
      basePoint.x = curveEnd.x - Constants.edgeControlPointOffset;
    }

    // NOTE(lin): If the curve end is the attractor center, then the contorl point is to the left of the end point.
    // Otherwise, we mirror the attractor center against the curve end, and further project the mirrored point,
    // until its x equals curveStart.x, or its y equals midpoint.y, whichever happens first.
    const attractorCenter = this.getAttractorCenter();

    if (curveEnd.x === attractorCenter.x && curveEnd.y === attractorCenter.y) {
      return {
        x: basePoint.x,
        y: curveEnd.y,
      };
    }

    const dx = attractorCenter.x - curveEnd.x;
    const dy = attractorCenter.y - curveEnd.y;
    let x = basePoint.x;
    let y = curveEnd.y - (dy * (curveEnd.x - basePoint.x)) / dx;

    if ((curveStart.y > curveEnd.y && y > curveStart.y) || (curveStart.y < curveEnd.y && y < curveStart.y)) {
      // NOTE(lin): y has reached beyond curveStart.y. Solve for x instead so that the curve doesn't slack.
      x = curveEnd.x + (dx * (curveStart.y - curveEnd.y)) / dy;
      y = curveStart.y;
    }

    if (isTargetLeftOfSource && Math.abs(y - curveEnd.y) < Constants.edgeFlippedPathMinOffset) {
      // NOTE(lin): Make sure the curve don't go left through the same path going right towards the control point.
      x -= Constants.edgeFlippedPathMinOffset;

      if (y > curveEnd.y) {
        y += Constants.edgeFlippedPathMinOffset;
      } else {
        y -= Constants.edgeFlippedPathMinOffset;
      }
    }

    return {
      x,
      y,
    };
  }

  private getEndControlPointForVerticalFlex(curveStart: Coord2d, curveEnd: Coord2d, basePoint: Coord2d): Coord2d {
    const isTargetAboveSource = curveEnd.y < curveStart.y;
    if (isTargetAboveSource) {
      basePoint.y = curveEnd.y - Constants.edgeControlPointOffset;
    }

    // NOTE(lin): If the curve end is the attractor center, then the contorl point is right above the end point.
    // Otherwise, we mirror the attractor center against the curve end, and further project the mirrored point,
    // until its x equals curveStart.x, or its y equals midpoint.y, whichever happens first.
    const attractorCenter = this.getAttractorCenter();

    if (curveEnd.x === attractorCenter.x && curveEnd.y === attractorCenter.y) {
      return {
        x: curveEnd.x,
        y: basePoint.y,
      };
    }

    const dx = attractorCenter.x - curveEnd.x;
    const dy = attractorCenter.y - curveEnd.y;
    let x = curveEnd.x - (dx * (curveEnd.y - basePoint.y)) / dy;
    let y = basePoint.y;

    if ((curveStart.x > curveEnd.x && x > curveStart.x) || (curveStart.x < curveEnd.x && x < curveStart.x)) {
      // NOTE(lin): x has reached beyond curveStart.x. Solve for y instead so that the curve doesn't slack.
      x = curveStart.x;
      y = curveEnd.y + ((curveStart.x - curveEnd.x) * dy) / dx;
    }

    if (isTargetAboveSource && Math.abs(x - curveEnd.x) < Constants.edgeFlippedPathMinOffset) {
      // NOTE(lin): Make sure the curve don't go down through the same path going up towards the control point.
      y -= Constants.edgeFlippedPathMinOffset;

      if (x > curveEnd.x) {
        x += Constants.edgeFlippedPathMinOffset;
      } else {
        x -= Constants.edgeFlippedPathMinOffset;
      }
    }

    return {
      x,
      y,
    };
  }

  private onAnimationEnd = (event: React.AnimationEvent<Element>): void => {
    this.setState({
      isFadingIn: false,
    });
  };

  private onDragStart = (event: React.DragEvent<Element>, dragTargetType: EdgeDragAndDropTargetType): void => {
    const position: Coord2d = {
      x: event.pageX,
      y: event.pageY,
    };

    this.props.onDragStart({
      edgeId: this.props.id,
      localEdgeId: this.props.localEdgeId,
      sourceNodeId: this.props.sourceNodeProps.id,
      targetNodeId: this.props.targetNodeProps.id,
      dragTargetType,
      startAnchorPoint: this.getAnchorPoint(),
      startReceptorPoint: this.getReceptorPoint(),
      startPosition: position,
      currentPosition: position,
    });
  };

  private onAnchorReceive = (event: React.DragEvent<Element>): void => {
    this.props.onAnchorReceive({
      edgeId: this.props.id,
      receivingLocalEdgeId: this.props.localEdgeId,
      receivingNodeId: this.props.sourceNodeProps.id,
      dropTargetType: 'Anchor',
    });
  };

  private onReceptorReceive = (event: React.DragEvent<Element>): void => {
    this.props.onReceptorReceive({
      edgeId: this.props.id,
      receivingLocalEdgeId: undefined,
      receivingNodeId: this.props.targetNodeProps.id,
      dropTargetType: 'Receptor',
    });
  };
}
