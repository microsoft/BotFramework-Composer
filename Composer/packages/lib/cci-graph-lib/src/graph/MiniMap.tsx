import * as React from 'react';

import * as Constants from './Constants';
import './MiniMap.scss';

export interface MiniMapProps {
  onViewPortTranslated: (dx: number, dy: number) => void;
}

export interface MiniMapState {
  mapSize: number;
  targetWidth: number;
  targetHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  viewportLeftOffset: number;
  viewportTopOffset: number;
  contentScale: number;
}

interface MiniMapMeasurements {
  canvasWidth: number;
  canvasHeight: number;
  canvasScale: number;
  miniContentScale: number;
}

export class MiniMap extends React.Component<MiniMapProps, MiniMapState> {
  private translateStartX: number;
  private translateStartY: number;
  private isTranslating: boolean;
  private viewPortRef: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: Readonly<MiniMapProps>) {
    super(props);

    this.state = {
      mapSize: 0,
      targetWidth: 0,
      targetHeight: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      viewportLeftOffset: 0,
      viewportTopOffset: 0,
      contentScale: 1,
    };

    this.initTransformParams();
  }

  public render(): React.ReactNode {
    const {
      mapSize,
      targetWidth,
      targetHeight,
      viewportWidth,
      viewportHeight,
      viewportLeftOffset,
      viewportTopOffset,
    } = this.state;
    const dimensionalParams = [mapSize, targetWidth, targetHeight, viewportWidth, viewportHeight];
    if (dimensionalParams.some(param => param === 0)) {
      return null;
    }

    const { canvasWidth, canvasHeight, canvasScale, miniContentScale } = this.getMeasurements();

    const canvasStyle: React.CSSProperties = {
      width: canvasWidth * canvasScale,
      height: canvasHeight * canvasScale,
    };

    const viewportSizeOffset = 2; // NOTE(lin): Cancel out border width.
    const clientWidth = viewportWidth * canvasScale - viewportSizeOffset;
    const clientHeight = viewportHeight * canvasScale - viewportSizeOffset;
    const viewportStyle: React.CSSProperties = {
      width: clientWidth,
      height: clientHeight,
      left: viewportLeftOffset * canvasScale,
      top: viewportTopOffset * canvasScale,
      boxShadow: `0 0 0 ${mapSize}px rgba(120, 120, 120, 0.3)`,
    };

    const contentStyle: React.CSSProperties = {
      transform: `scale(${miniContentScale})`,
      transformOrigin: 'left top',
    };

    return (
      <div
        className="mini-map"
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUpOrLeave}
        onMouseLeave={this.handleMouseUpOrLeave}
      >
        <div className="canvas" style={canvasStyle}>
          <div className="content" style={contentStyle}>
            {this.props.children}
          </div>
          <div ref={this.viewPortRef} className="viewport" draggable={false} style={viewportStyle} />
        </div>
      </div>
    );
  }

  public updateParameters(params: MiniMapState): void {
    this.setState({
      ...params,
    });
  }

  private handleClick = (e: React.MouseEvent<HTMLElement>): void => {
    if (this.viewPortRef && this.viewPortRef.current) {
      const { left, right, top, bottom } = this.viewPortRef.current.getBoundingClientRect();
      const x = (left + right) * 0.5;
      const y = (top + bottom) * 0.5;

      const { miniContentScale } = this.getMeasurements();
      const effectiveDX = (e.clientX - x) / miniContentScale;
      const effectiveDY = (e.clientY - y) / miniContentScale;

      this.props.onViewPortTranslated(effectiveDX, effectiveDY);
    }
  };

  private handleMouseDown = (e: React.MouseEvent<HTMLElement>): void => {
    this.translateStartX = e.clientX;
    this.translateStartY = e.clientY;
    this.isTranslating = true;
  };

  private handleMouseMove = (e: React.MouseEvent<HTMLElement>): void => {
    if (this.isTranslating) {
      if (e.buttons === Constants.mouseButtons.left) {
        e.preventDefault(); // NOTE(lin): Default behavior causes text in viewport to get randomly selected during mouse-move.

        const { miniContentScale } = this.getMeasurements();
        const effectiveDX = (e.clientX - this.translateStartX) / miniContentScale;
        const effectiveDY = (e.clientY - this.translateStartY) / miniContentScale;

        this.translateStartX = e.clientX;
        this.translateStartY = e.clientY;

        this.props.onViewPortTranslated(effectiveDX, effectiveDY);
      }
    }
  };

  private handleMouseUpOrLeave = (): void => {
    this.isTranslating = false;
  };

  private initTransformParams(): void {
    this.translateStartX = 0;
    this.translateStartY = 0;
    this.isTranslating = false;
  }

  private getMeasurements(): MiniMapMeasurements {
    const { mapSize, targetWidth, targetHeight, viewportWidth, viewportHeight, contentScale } = this.state;
    const canvasWidth = Math.max(targetWidth * contentScale, viewportWidth);
    const canvasHeight = Math.max(targetHeight * contentScale, viewportHeight);
    const canvasScale = Math.min(mapSize / canvasWidth, mapSize / canvasHeight);
    const miniContentScale = contentScale * canvasScale;

    return {
      canvasWidth,
      canvasHeight,
      canvasScale,
      miniContentScale,
    };
  }
}
