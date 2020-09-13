// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __rest } from 'tslib';
import React from 'react';
import { ActionHeader } from '../ActionHeader';
import { CardTemplate } from './CardTemplate';
export var ActionCard = function (_a) {
  var header = _a.header,
    body = _a.body,
    footer = _a.footer,
    widgetContext = __rest(_a, ['header', 'body', 'footer']);
  var disabled = widgetContext.data.disabled === true;
  return React.createElement(CardTemplate, {
    body: body,
    disabled: disabled,
    footer: footer,
    header: header || React.createElement(ActionHeader, __assign({}, widgetContext)),
  });
};
//# sourceMappingURL=ActionCard.js.map
