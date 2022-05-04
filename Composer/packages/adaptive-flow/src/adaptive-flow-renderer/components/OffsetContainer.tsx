// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { Interpolation, jsx } from '@emotion/react';
import React, { ReactNode } from 'react';

interface OffsetContainerProps {
  offset: { x: number; y: number };
  children: ReactNode;
  css?: Interpolation<unknown>;
}

export class OffsetContainer extends React.Component<OffsetContainerProps, object> {
  render(): ReactNode {
    const { offset, children, ...otherProps } = this.props;
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
        data-testid="OffsetContainer"
        {...otherProps}
      >
        {children}
      </div>
    );
  }
}
