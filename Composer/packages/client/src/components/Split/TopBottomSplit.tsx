// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import styled from '@emotion/styled';
import { default as Measure, ContentRect } from 'react-measure';

const defaultSplitterHeight = 5;

const MeasureDiv = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
`;

const Root = styled.div(({ topRowHeight, splitterHeight }: { topRowHeight: string; splitterHeight: number }) => ({
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateAreas: `'top' 'split' 'bottom'`,
  gridTemplateRows: `${topRowHeight} ${splitterHeight}px 1fr`,
}));

const Top = styled.div`
  width: 100%;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
  grid-area: top;
`;

const Split = styled.div`
  width: 100%;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
  grid-area: split;
  cursor: row-resize;
  background: transparent;
  &:hover .default-split-visual {
    background: gray;
  }
`;

const DefaultSplitVisual = styled.div(({ splitterHeight }: { splitterHeight: number }) => ({
  width: '100%',
  height: '1px',
  boxSizing: 'border-box',
  outline: 'none',
  overflow: 'hidden',
  background: 'silver',
  cursor: 'row-resize',
  marginTop: `${splitterHeight / 2}px`,
}));

const Bottom = styled.div`
  width: 100%;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
  grid-area: bottom;
`;

// ensures a value can be used in gridTemplateColumns
// defaults to '1fr'
const toGridExtent = (value?: string | number) => {
  if (value === undefined || value === null) {
    return '1fr';
  }

  if (typeof value === 'string') {
    if (value.trim().length === 0) {
      return '1fr';
    }

    if (value.endsWith('px') || value.endsWith('%') || value.endsWith('fr')) {
      return value;
    }
  }

  return `${value}px`;
};

// constrains the extend of a pane given split constraints
const constrainPaneExtent = (
  /**
   * the requested extend of the primary pane
   */
  primary: number,
  constraints: {
    /**
     * the total extent available for primary, splitter, and secondary
     */
    total: number;
    /**
     *  the extent of the splitter
     */
    splitter: number;
    /**
     * the minimum extend of the primary pane
     */
    minPrimary?: number;
    /**
     * the minimum extend of the secondary pane
     */
    minSecondary?: number;
  }
): number => {
  const { total, splitter, minPrimary, minSecondary } = constraints;

  // ensure within total bounds
  let newPrimary = Math.max(0, Math.min(primary, total - splitter));

  // adjust satisfy minSecondary
  const secondary = total - (newPrimary + splitter);
  if (minSecondary && secondary < minSecondary) {
    newPrimary = newPrimary - Math.max(0, minSecondary - secondary);
  }

  // adjust to satisfy minPrimary
  if (minPrimary && newPrimary < minPrimary) {
    newPrimary = minPrimary;
  }

  // ensure within total bounds after adjustments
  return Math.max(0, Math.min(newPrimary, total - splitter));
};

type Props = {
  initialTopGridHeight?: string | number;
  minTopPixels?: number;
  minBottomPixels?: number;
  splitterHeight?: number;
  renderSplitter?: () => React.ReactNode;
};

export const TopBottomSplit = (props: React.PropsWithChildren<Props>) => {
  const {
    initialTopGridHeight,
    minBottomPixels,
    minTopPixels,
    splitterHeight = defaultSplitterHeight,
    renderSplitter,
  } = props;

  const [currentContentHeight, setCurrentContentHeight] = React.useState<number>(0);
  const [currentTopHeight, setCurrentTopHeight] = React.useState<number>(0);

  const [topHeight, setTopHeight] = React.useState(() => {
    // If the default is a number, then use it or the top minimum as a value.
    const numericValue = Number(initialTopGridHeight);
    return isNaN(numericValue) ? -1 : Math.max(numericValue, minTopPixels ?? numericValue);
  });

  const [topStart, setTopStart] = React.useState(0);
  const [screenStart, setScreenStart] = React.useState(0);

  const constrainTop = (value: number): number => {
    return constrainPaneExtent(value, {
      total: currentContentHeight,
      splitter: splitterHeight,
      minPrimary: minTopPixels,
      minSecondary: minBottomPixels,
    });
  };

  React.useEffect(() => {
    if (topHeight != -1) {
      const newTop = constrainTop(topHeight);
      setTopHeight(newTop);
    }
  }, [currentContentHeight, splitterHeight]);

  const onContentMeasure = (contentRect: ContentRect) => {
    contentRect.bounds && setCurrentContentHeight(contentRect.bounds.height);
  };

  const onTopMeasure = (contentRect: ContentRect) => {
    contentRect.bounds && setCurrentTopHeight(contentRect.bounds.height);
  };

  const onSplitMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(1);
    setScreenStart(event.screenY);
    setTopStart(currentTopHeight);
  };

  const onSplitMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(1)) {
      // calculate candidate top
      const newTop = constrainTop(topStart + (event.screenY - screenStart));
      setTopHeight(newTop);
    }
  };

  const onSplitMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(1);
  };

  // If the top height has never been set
  // try using the default as a number and constraining it
  let renderTopHeight = `${topHeight}px`;
  if (topHeight < 0) {
    renderTopHeight = toGridExtent(initialTopGridHeight);
  }

  const children = React.Children.toArray(props.children);
  const topChild = children.length > 0 ? children[0] : <div />;
  const bottomChild = children.length > 1 ? children[1] : <div />;

  const renderSplitVisual =
    renderSplitter ??
    (() => {
      return <DefaultSplitVisual className="default-split-visual" splitterHeight={splitterHeight} />;
    });

  return (
    <Measure bounds onResize={onContentMeasure}>
      {({ measureRef }) => (
        <MeasureDiv ref={measureRef}>
          <Root splitterHeight={splitterHeight} topRowHeight={renderTopHeight}>
            <Top>
              <Measure bounds onResize={onTopMeasure}>
                {({ measureRef: topRef }) => <MeasureDiv ref={topRef}>{topChild}</MeasureDiv>}
              </Measure>
            </Top>
            <Split
              tabIndex={-1}
              onMouseDown={onSplitMouseDown}
              onMouseMove={onSplitMouseMove}
              onMouseUp={onSplitMouseUp}
            >
              {renderSplitVisual()}
            </Split>
            <Bottom>{bottomChild}</Bottom>
          </Root>
        </MeasureDiv>
      )}
    </Measure>
  );
};
