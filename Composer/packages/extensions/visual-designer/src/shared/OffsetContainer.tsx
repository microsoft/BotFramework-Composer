// eslint-disable-next-line no-unused-vars
import React, { ReactNode } from 'react';

type Props = {
  offset?: { [key: string]: number };
  children: ReactNode;
  styles: object;
};

export class OffsetContainer extends React.Component<Props, object> {
  static defaultProps = {
    styles: {},
  };
  render(): ReactNode {
    const { offset, children, styles } = this.props;
    if (!offset) return children;

    return (
      <div
        style={{
          position: 'absolute',
          left: offset.x,
          top: offset.y,
          transitionDuration: '50ms',
          transitionProperty: 'left, right, top, bottom',
          ...styles,
        }}
      >
        {children}
      </div>
    );
  }
}
