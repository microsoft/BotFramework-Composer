/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react';

import { IconBrickSize } from '../../constants/ElementSizes';

export const IconBrick = ({ onClick }): JSX.Element => {
  return (
    <div
      css={{
        ...IconBrickSize,
        background: '#FFFFFF',
        boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)',
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FED9CC',
          width: 16,
          height: 16,
          borderRadius: '8px',
        }}
      >
        <Icon iconName="ErrorBadge" style={{ fontSize: 8 }} />
      </div>
    </div>
  );
};
