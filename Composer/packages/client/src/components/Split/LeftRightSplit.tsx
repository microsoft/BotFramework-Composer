// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import styled, { css } from 'styled-components';
import { default as Measure, ContentRect } from 'react-measure';

// -------------------- STYLE --------------------

const defaultSplitterWidth = 5;

const fullDivCss = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
`;

const MeasureDiv = styled.div`
  ${fullDivCss}
`;

const Root = styled.div.attrs(
  ({ leftColWidth, splitterWidth }: { leftColWidth: string; splitterWidth: number }): any => ({
    style: {
      gridTemplateColumns: `${leftColWidth} ${splitterWidth}px 1fr`,
    },
  })
)`
  ${fullDivCss}
  display: grid;
  grid-template-rows: 1fr;
  grid-template-areas: 'left split right';
`;

const Left = styled.div`
  height: 100%;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
  grid-area: left;
`;

const Split = styled.div`
  height: 100%;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
  grid-area: split;
  cursor: col-resize;
  background: transparent;
  &:hover .default-split-visual {
    background: gray;
  }
`;

const DefaultSplitVisual = styled.div.attrs(({ splitterWidth }: { splitterWidth: number }): any => ({
  halfWidth: `${splitterWidth / 2}px`,
}))`
  height: 100%;
  width: 1px;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
  background: silver;
  cursor: col-resize;
  margin-left: ${(props) => props.halfWidth};
`;

const Right = styled.div`
  height: 100%;
  box-sizing: border-box;
  outline: none;
  overflow: hidden;
  grid-area: right;
`;

// -------------------- UTILITIES --------------------

// ensures a value can be used in gridTemplateColumns
// defaults to 'auto'
const toGridWidth = (value?: string | number) => {
  if (value === undefined || value === null) {
    return 'auto';
  }

  if (typeof value === 'string') {
    if (value.trim().length === 0) {
      return 'auto';
    }

    if (value.endsWith('px') || value.endsWith('%') || value.endsWith('fr')) {
      return value;
    }
  }

  return `${value}px`;
};

// constrains the extend of a pane given split constraints
const constrainPaneExtent = (
  primary: number,
  constraints: {
    total: number;
    splitter: number;
    minPrimary?: number;
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

// -------------------- COMPONENT --------------------

type Props = {
  initialLeftGridWidth?: string | number;
  minLeftPixels?: number;
  minRightPixels?: number;
  splitterWidth?: number;
  renderSplitter?: () => JSX.Element;
};

export const LeftRightSplit = (props: React.PropsWithChildren<Props>): JSX.Element => {
  const {
    initialLeftGridWidth: defaultLeftWidth,
    minRightPixels,
    minLeftPixels,
    splitterWidth = defaultSplitterWidth,
    renderSplitter,
  } = props;

  // -------------------- HOOKS --------------------

  const [currentContentWidth, setCurrentContentWidth] = React.useState<number>(0);
  const [currentLeftWidth, setCurrentLeftWidth] = React.useState<number>(0);

  const [leftWidth, setLeftWidth] = React.useState(() => {
    // If the default is a number, then use it or the left minimum as a value.
    const numericValue = Number(defaultLeftWidth);
    return isNaN(numericValue) ? -1 : Math.max(numericValue, minLeftPixels ?? numericValue);
  });

  const [leftStart, setLeftStart] = React.useState(0);
  const [screenStart, setScreenStart] = React.useState(0);

  React.useEffect(() => {
    if (leftWidth !== -1) {
      const newLeft = constrainLeft(leftWidth);
      setLeftWidth(newLeft);
    }
  }, [currentContentWidth, splitterWidth]);

  // -------------------- MEASUREMENT --------------------

  const constrainLeft = (value: number): number => {
    return constrainPaneExtent(value, {
      total: currentContentWidth,
      splitter: splitterWidth,
      minPrimary: minLeftPixels,
      minSecondary: minRightPixels,
    });
  };

  const onContentMeasure = (contentRect: ContentRect) => {
    contentRect.bounds && setCurrentContentWidth(contentRect.bounds.width);
  };

  const onLeftMeasure = (contentRect: ContentRect) => {
    contentRect.bounds && setCurrentLeftWidth(contentRect.bounds.width);
  };

  // -------------------- MOUSE HANDLERS --------------------

  const onSplitMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(1);
    setScreenStart(event.screenX);
    setLeftStart(currentLeftWidth);
  };

  const onSplitMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(1)) {
      // calculate candidate left
      const newLeft = constrainLeft(leftStart + (event.screenX - screenStart));
      setLeftWidth(newLeft);
    }
  };

  const onSplitMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(1);
  };

  // -------------------- RENDER --------------------

  // If the left width has never been set
  // try using the default as a number and constraining it
  let renderLeftWidth = `${leftWidth}px`;
  if (leftWidth < 0) {
    renderLeftWidth = toGridWidth(defaultLeftWidth);
  }

  const children = React.Children.toArray(props.children);
  const leftChild = children.length > 0 ? children[0] : <div />;
  const rightChild = children.length > 1 ? children[1] : <div />;

  const renderSplitVisual =
    renderSplitter ??
    (() => {
      return <DefaultSplitVisual className="default-split-visual" splitterWidth={splitterWidth} />;
    });

  return (
    <Measure bounds onResize={onContentMeasure}>
      {({ measureRef }) => (
        <MeasureDiv ref={measureRef}>
          <Root leftColWidth={renderLeftWidth} splitterWidth={splitterWidth}>
            <Left>
              <Measure bounds onResize={onLeftMeasure}>
                {({ measureRef: leftRef }) => <MeasureDiv ref={leftRef}>{leftChild}</MeasureDiv>}
              </Measure>
            </Left>
            <Split
              tabIndex={-1}
              onMouseDown={onSplitMouseDown}
              onMouseMove={onSplitMouseMove}
              onMouseUp={onSplitMouseUp}
            >
              {renderSplitVisual()}
            </Split>
            <Right>{rightChild}</Right>
          </Root>
        </MeasureDiv>
      )}
    </Measure>
  );
};
