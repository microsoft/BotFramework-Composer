// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { IconBrickSize } from '../constants/ElementSizes';

export const IconBrick = ({ onClick, disabled = false }): JSX.Element => {
  const brickColor = disabled ? 'transparent' : '#FFFFFF';
  const iconColor = disabled ? '#ddd' : '#FED9CC';

  return (
    <div
      css={{
        ...IconBrickSize,
        background: brickColor,
        boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)',
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      data-testid="IconBrick"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: iconColor,
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
