// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IconBrickSize } from '../../constants/ElementSizes';
export var IconBrick = function (_a) {
  var onClick = _a.onClick;
  return jsx(
    'div',
    {
      css: __assign(__assign({}, IconBrickSize), {
        background: '#FFFFFF',
        boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)',
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }),
      onClick: function (e) {
        e.stopPropagation();
        onClick(e);
      },
    },
    jsx(
      'div',
      {
        css: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FED9CC',
          width: 16,
          height: 16,
          borderRadius: '8px',
        },
      },
      jsx(Icon, { iconName: 'ErrorBadge', style: { fontSize: 8 } })
    )
  );
};
//# sourceMappingURL=IconBrick.js.map
