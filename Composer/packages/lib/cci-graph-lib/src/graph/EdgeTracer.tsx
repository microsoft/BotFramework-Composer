import * as React from 'react';

import { EdgeDragData } from './GraphSchemas';

export interface EdgeTracerProps {
  id: string;
  dragData?: EdgeDragData;
  transformScale: number;
}

export class EdgeTracer extends React.Component<EdgeTracerProps> {
  public render(): React.ReactNode {
    return (
      <div className="edge">
        <svg className="paths edge-tracer" xmlns="http://www.w3.org/2000/svg">
          {this.renderTracerPath()}
        </svg>
      </div>
    );
  }

  private renderTracerPath(): React.ReactNode {
    const {
      startAnchorPoint,
      startReceptorPoint,
      startPosition,
      currentPosition,
      dragTargetType,
    } = this.props.dragData;

    const currentAnchor = {
      x: startAnchorPoint.x,
      y: startAnchorPoint.y,
    };

    const currentReceptor = {
      x: startReceptorPoint.x,
      y: startReceptorPoint.y,
    };

    const dx = (currentPosition.x - startPosition.x) / this.props.transformScale;
    const dy = (currentPosition.y - startPosition.y) / this.props.transformScale;
    if (dragTargetType === 'Anchor') {
      currentAnchor.x += dx;
      currentAnchor.y += dy;
    } else {
      currentReceptor.x += dx;
      currentReceptor.y += dy;
    }

    const d = `M${currentAnchor.x} ${currentAnchor.y} L ${currentReceptor.x} ${currentReceptor.y}`;
    return <path className="path" d={d} />;
  }
}
