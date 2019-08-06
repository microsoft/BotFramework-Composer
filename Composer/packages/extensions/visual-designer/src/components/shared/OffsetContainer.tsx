/** @jsx jsx */
import { jsx } from '@emotion/core';
// eslint-disable-next-line no-unused-vars
import React, { ReactNode } from 'react';

interface OffsetContainerProps {
  offset: { x: number; y: number };
  children: ReactNode;
}

export class OffsetContainer extends React.Component<OffsetContainerProps, object> {
  render(): ReactNode {
    const { offset, children } = this.props;
    if (!offset) return children;

    return (
      <div
        css={[
          {
            position: 'absolute',
            left: offset.x,
            top: offset.y,
            transitionDuration: '50ms',
            transitionProperty: 'left, right, top, bottom',
          },
        ]}
        {...this.props}
      >
        {children}
      </div>
    );
  }
}
