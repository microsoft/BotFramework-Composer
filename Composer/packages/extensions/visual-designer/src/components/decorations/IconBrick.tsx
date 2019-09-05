/** @jsx jsx */
import { jsx } from '@emotion/core';

import { IconBrickSize } from '../../constants/ElementSizes';

export const IconBrick = ({ onClick }): JSX.Element => {
  return (
    <div
      css={{
        ...IconBrickSize,
        background: '#FFFFFF',
        boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)',
        borderRadius: '2px',
      }}
      onClick={onClick}
    >
      X
    </div>
  );
};
