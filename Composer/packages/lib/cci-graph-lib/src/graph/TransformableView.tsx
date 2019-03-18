import * as React from 'react';
import { R } from '../common/Schemas';
import * as Constants from './Constants';
import { Coord2d } from './GraphSchemas';
import { MiniMap } from './MiniMap';
import './TransformableView.scss';

export interface TransformButtonsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleMiniMap: () => void;
}

export type TransformButtonsRenderer = (props: R<TransformButtonsProps>) => JSX.Element;

export interface TransformableViewProps {
  isEnabled: boolean;
  transformButtonsRenderer: TransformButtonsRenderer;
  miniMapContent?: React.ReactNode;
  onScaleChanged?: (scale: number) => void;
  onClick?: (event: React.MouseEvent<Element>) => void;
}

interface TransformableViewParams {
  scale: number;
  dx: number;
  dy: number;
  isTranslating: boolean;
}

interface TransformableViewState {
  isMiniMapCollapsed: boolean;
}

const TRANSFORM_TARGET_CLASS_NAME = 'transform-target';

const SCALE_INCREMENT = 0.1;
const SCALE_UP_LIMIT = 3;
const SCALE_DOWN_LIMIT = 0.2;

/* NOTE(lin): This component provides transform utility, such as scaling and translation, to its children components.
   We don't use React state to update the transform. Instead, we directly update the "transform" style of the "transform target" element,
   in order to avoid redrawing children components and their sub-components on user input (e.g. mouse move, mouse wheel),
   which would cause noticeable perf degradation in IE.
*/
export class TransformableView extends React.Component<TransformableViewProps, TransformableViewState> {
  private viewRootElement: React.RefObject<HTMLDivElement> = React.createRef();
  private contentBoundaryElement: React.RefObject<HTMLDivElement> = React.createRef();
  private transformTargetElement: React.RefObject<HTMLDivElement> = React.createRef();
  private miniMapRef: React.RefObject<MiniMap> = React.createRef();
  private transformParams: TransformableViewParams;
  private translateStartX: number;
  private translateStartY: number;

  constructor(props: TransformableViewProps) {
    super(props);

    this.initTransformParams();

    this.state = {
      isMiniMapCollapsed: true,
    };
  }

  public refreshViewAndMiniMap = (): void => {
    this.updateView();
    this.reRenderMiniMap();
  };

  public scrollPointIntoView(point: Coord2d): void {
    const viewRoot = (this.viewRootElement && this.viewRootElement.current) || null;
    if (viewRoot) {
      const { x, y } = point;
      const { clientWidth, clientHeight } = viewRoot;
      const left = x - clientWidth * 0.5;
      const top = y - clientHeight * 0.5;

      if (viewRoot.scrollTo) {
        viewRoot.scrollTo({
          behavior: 'smooth',
          left,
          top,
        });
      } else {
        // NOTE(lin): The Edge browser doesn't support 'scrollTo'.
        viewRoot.scrollLeft = left;
        viewRoot.scrollTop = top;
      }
    }
  }

  public componentDidUpdate(): void {
    this.reRenderMiniMap();
  }

  public render(): JSX.Element {
    if (this.props.isEnabled) {
      return (
        <div className="transformable-view">
          <div
            className={`scrollable  ${Constants.transformInteractiveZoneClassName}`}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
            onWheel={this.handleMouseWheel}
            onScroll={this.handleScroll}
            onClick={this.props.onClick}
            onTransitionEnd={this.refreshViewAndMiniMap}
            ref={this.viewRootElement}
          >
            <div
              className={`boundary ${Constants.transformInteractiveZoneClassName}`}
              ref={this.contentBoundaryElement}
            >
              <div
                className={`${TRANSFORM_TARGET_CLASS_NAME} ${Constants.transformInteractiveZoneClassName}`}
                ref={this.transformTargetElement}
              >
                {this.props.children}
              </div>
            </div>
          </div>
          {this.props.transformButtonsRenderer({
            onZoomIn: this.handleZoomIn,
            onZoomOut: this.handleZoomOut,
            onResetZoom: this.handleZoomPanReset,
            onToggleMiniMap: this.handleMiniMapToggle,
          })}
          {this.renderMiniMap()}
        </div>
      );
    } else {
      return <div>{this.props.children}</div>;
    }
  }

  private renderMiniMap(): React.ReactNode {
    if (!this.viewRootElement.current || !this.transformTargetElement.current || !this.props.miniMapContent) {
      return null;
    }

    const collapsedClass = this.state.isMiniMapCollapsed ? 'collapsed' : '';

    return (
      <div className={`mini-map-container ${collapsedClass}`}>
        <MiniMap ref={this.miniMapRef} onViewPortTranslated={this.onMiniMapViewPortTranslated}>
          {this.props.miniMapContent}
        </MiniMap>
      </div>
    );
  }

  private initTransformParams(): void {
    this.transformParams = {
      scale: 1,
      dx: 0,
      dy: 0,
      isTranslating: false,
    };

    this.translateStartX = 0;
    this.translateStartY = 0;

    if (this.props.onScaleChanged) {
      this.props.onScaleChanged(1);
    }
  }

  private handleMouseDown = (e: React.MouseEvent<HTMLElement>): void => {
    if (this.canTranslateTarget(e)) {
      this.translateStartX = e.clientX;
      this.translateStartY = e.clientY;
      this.setTranslationState(true);
    }
  };

  private handleMouseMove = (e: React.MouseEvent<HTMLElement>): void => {
    if (this.transformParams.isTranslating) {
      if (e.buttons === Constants.mouseButtons.left) {
        e.preventDefault(); // NOTE(lin): Default behavior causes text in viewport to get randomly selected during mouse-move.
        this.transformParams.dx = this.translateStartX - e.clientX;
        this.transformParams.dy = this.translateStartY - e.clientY;

        this.translateStartX = e.clientX;
        this.translateStartY = e.clientY;

        this.refreshViewAndMiniMap();
      } else {
        this.setTranslationState(false);
      }
    }
  };

  private handleMouseUp = (): void => {
    this.setTranslationState(false);
  };

  private handleMouseWheel = (e: React.WheelEvent<HTMLElement>): void => {
    if (e.ctrlKey) {
      e.preventDefault();
      this.updateScale(e.deltaY > 0 ? -SCALE_INCREMENT : SCALE_INCREMENT);
    }
  };

  private handleZoomIn = (): void => {
    this.updateScale(SCALE_INCREMENT);
  };

  private handleZoomOut = (): void => {
    this.updateScale(-SCALE_INCREMENT);
  };

  private handleZoomPanReset = (): void => {
    this.resetPanAndZoom();
  };

  private handleMiniMapToggle = (): void => {
    this.setState(prevstate => {
      return {
        isMiniMapCollapsed: !prevstate.isMiniMapCollapsed,
      };
    });
  };

  private handleScroll = (e: React.UIEvent): void => {
    this.reRenderMiniMap();
  };

  private onMiniMapViewPortTranslated = (dx: number, dy: number): void => {
    this.transformParams.dx = dx;
    this.transformParams.dy = dy;
    this.refreshViewAndMiniMap();
    this.transformParams.dx = 0;
    this.transformParams.dy = 0;
  };

  private reRenderMiniMap(): void {
    if (this.state.isMiniMapCollapsed || !this.miniMapRef.current) {
      return;
    }

    const { scrollWidth, scrollHeight } = this.transformTargetElement.current;
    const { clientWidth, clientHeight, scrollLeft, scrollTop } = this.viewRootElement.current;
    const { scale } = this.transformParams;

    this.miniMapRef.current.updateParameters({
      mapSize: 200,
      targetWidth: scrollWidth,
      targetHeight: scrollHeight,
      viewportWidth: clientWidth,
      viewportHeight: clientHeight,
      viewportLeftOffset: scrollLeft,
      viewportTopOffset: scrollTop,
      contentScale: scale,
    });
  }

  private resetPanAndZoom(): void {
    this.initTransformParams();
    this.refreshViewAndMiniMap();
  }

  private updateScale(scaleIncrement: number): void {
    const nextScale = this.transformParams.scale + scaleIncrement;

    if (nextScale >= SCALE_DOWN_LIMIT && nextScale <= SCALE_UP_LIMIT) {
      this.transformParams.scale = nextScale;
      this.refreshViewAndMiniMap();

      if (this.props.onScaleChanged) {
        this.props.onScaleChanged(nextScale);
      }
    }
  }

  private canTranslateTarget(e: React.MouseEvent<HTMLElement>): boolean {
    const element = e.target as HTMLElement;
    let classNames: string[] = [];
    if (typeof element.className === 'string') {
      /* NOTE(lin): className could be of type SVGAnimatedString which doesn't have a split method.*/
      classNames = element.className.split(' ');
    }

    return classNames.some(className => {
      return className === Constants.transformInteractiveZoneClassName;
    });
  }

  private setTranslationState(isTranslating: boolean): void {
    this.transformParams.dx = 0;
    this.transformParams.dy = 0;
    this.transformParams.isTranslating = isTranslating;

    const translatingClassName = 'transform-translating';

    if (isTranslating) {
      this.viewRootElement.current.classList.add(translatingClassName);
    } else {
      this.viewRootElement.current.classList.remove(translatingClassName);
    }
  }

  private updateView(): void {
    this.updateTransformTarget();
    this.updateContentBoundary();
    this.updateViewRoot();
  }

  private updateTransformTarget(): void {
    this.transformTargetElement.current.style.transformOrigin = 'left top';
    this.transformTargetElement.current.style.transform = `scale(${this.transformParams.scale})`;
  }

  private updateContentBoundary(): void {
    // NOTE(lin): When the transformTargetElement is scaled to below 1.0, Chrome would automatically shrink
    // scrollbars of viewRootElement, but Edge would keep the scrollbars the same size, making the scrollable area unnecessarily large.
    // Here, the boundaryElement, with a "hidden" overflow, is dynamically resized to fit the effective transform target area.
    // With such a wrapper, Edge would no longer render extra blank space outside of content.
    this.contentBoundaryElement.current.style.width = `${this.transformTargetElement.current.scrollWidth *
      this.transformParams.scale}px`;
    this.contentBoundaryElement.current.style.height = `${this.transformTargetElement.current.scrollHeight *
      this.transformParams.scale}px`;
  }

  private updateViewRoot(): void {
    this.viewRootElement.current.scrollLeft += this.transformParams.dx;
    this.viewRootElement.current.scrollTop += this.transformParams.dy;
  }
}
