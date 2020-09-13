// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { LoopIconSize } from '../constants/ElementSizes';
export var LoopIndicator = function (_a) {
  var onClick = _a.onClick;
  return jsx(
    'div',
    {
      css: {
        width: LoopIconSize.width,
        height: LoopIconSize.height,
        borderRadius: LoopIconSize.width / 2,
        background: '#656565',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      'data-testid': 'LoopIndicator',
      onClick: function (e) {
        e.stopPropagation();
        onClick();
      },
    },
    jsx(Icon, { css: { color: 'white', fontSize: LoopIconSize.width / 2 }, iconName: 'Sync' })
  );
};
//# sourceMappingURL=LoopIndicator.js.map
