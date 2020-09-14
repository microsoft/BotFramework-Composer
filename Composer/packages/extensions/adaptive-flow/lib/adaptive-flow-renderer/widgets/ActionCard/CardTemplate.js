// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { TextDiv } from '@bfc/ui-shared';
import { StandardNodeWidth } from '../../constants/ElementSizes';
import { ObiColors } from '../../constants/ElementColors';
import { ArrowLine } from '../../components/ArrowLine';
import {
  HeaderCSS,
  BodyCSS,
  FooterCSS,
  SeparateLineCSS,
  CardContainerCSS,
  DisabledCardContainerCSS,
} from './CardTemplateStyle';
export var CardTemplate = function (_a) {
  var header = _a.header,
    body = _a.body,
    footer = _a.footer,
    disabled = _a.disabled,
    onClick = _a.onClick,
    onClickHeader = _a.onClickHeader,
    onClickBody = _a.onClickBody,
    onClickFooter = _a.onClickFooter;
  var headerCSS = HeaderCSS;
  var bodyCSS = BodyCSS;
  var footerCSS = FooterCSS;
  var containerCSS = disabled ? DisabledCardContainerCSS : CardContainerCSS;
  var renderHeader = function (header) {
    return jsx('div', { className: 'CardNode__Header', css: headerCSS, onClick: onClickHeader }, header);
  };
  var renderBody = function (body) {
    return jsx(
      'div',
      { className: 'CardNode__Body', css: bodyCSS, onClick: onClickBody },
      jsx(TextDiv, { css: { width: '100%' } }, body)
    );
  };
  var renderFooter = function (footer) {
    return jsx(
      'div',
      { className: 'CardNode__Footer', css: footerCSS, onClick: onClickFooter },
      jsx(TextDiv, { css: { width: '100%' } }, footer)
    );
  };
  var renderSeparateline = function () {
    return jsx(
      'div',
      { className: 'Separator', css: SeparateLineCSS },
      jsx(ArrowLine, { arrowsize: 8, color: ObiColors.AzureGray3, width: StandardNodeWidth })
    );
  };
  // If body is null but footer not null, show footer as body.
  var _b = [body, footer].filter(function (x) {
      return x !== undefined && x !== null;
    }),
    displayedBody = _b[0],
    displayedFooter = _b[1];
  var showFooter = displayedFooter !== undefined;
  return jsx(
    'div',
    {
      className: 'CardNode',
      css: containerCSS,
      onClick: onClick
        ? function (e) {
            e.stopPropagation();
            onClick(e);
          }
        : undefined,
    },
    renderHeader(header),
    renderBody(displayedBody),
    showFooter ? renderSeparateline() : null,
    showFooter ? renderFooter(footer) : null
  );
};
//# sourceMappingURL=CardTemplate.js.map
