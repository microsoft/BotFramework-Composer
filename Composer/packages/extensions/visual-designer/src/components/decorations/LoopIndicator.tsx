// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { LoopIconSize } from '../../adaptive-sdk/constants/ElementSizes';

export const LoopIndicator = ({ onClick }) => {
  return (
    <div
      css={{
        width: LoopIconSize.width,
        height: LoopIconSize.height,
        borderRadius: LoopIconSize.width / 2,
        background: '#656565',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Icon iconName="Sync" css={{ color: 'white', fontSize: LoopIconSize.width / 2 }} />
    </div>
  );
};
