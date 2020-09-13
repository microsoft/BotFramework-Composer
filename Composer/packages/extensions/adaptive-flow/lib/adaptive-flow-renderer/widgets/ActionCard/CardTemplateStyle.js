// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __makeTemplateObject } from 'tslib';
import { css } from '@emotion/core';
import { HeaderHeight, StandardSectionHeight, StandardNodeWidth } from '../../constants/ElementSizes';
import { DisabledContainer } from '../styles/DisabledStyle';
var fullWidthSection = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  width: 100%;\n  box-sizing: border-box;\n'],
      ['\n  width: 100%;\n  box-sizing: border-box;\n']
    ))
);
export var HeaderCSS = css(
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(['\n  ', ';\n  height: ', 'px;\n'], ['\n  ', ';\n  height: ', 'px;\n'])),
  fullWidthSection,
  HeaderHeight
);
export var BodyCSS = css(
  templateObject_3 ||
    (templateObject_3 = __makeTemplateObject(
      ['\n  ', ';\n  min-height: ', 'px;\n  padding: 7px 8px;\n'],
      ['\n  ', ';\n  min-height: ', 'px;\n  padding: 7px 8px;\n']
    )),
  fullWidthSection,
  StandardSectionHeight
);
export var FooterCSS = css(
  templateObject_4 ||
    (templateObject_4 = __makeTemplateObject(
      ['\n  ', ';\n  min-height: ', 'px;\n  padding: 8px 8px;\n'],
      ['\n  ', ';\n  min-height: ', 'px;\n  padding: 8px 8px;\n']
    )),
  fullWidthSection,
  StandardSectionHeight
);
export var SeparateLineCSS = css(
  templateObject_5 ||
    (templateObject_5 = __makeTemplateObject(
      ['\n  display: block;\n  height: 0px;\n  overflow: visible;\n'],
      ['\n  display: block;\n  height: 0px;\n  overflow: visible;\n']
    ))
);
var containerCSS = css(
  templateObject_6 ||
    (templateObject_6 = __makeTemplateObject(
      [
        '\n  font-size: 12px;\n  cursor: pointer;\n  overflow: hidden;\n  border-radius: 2px 2px 0 0;\n  width: ',
        'px;\n  min-height: ',
        'px;\n',
      ],
      [
        '\n  font-size: 12px;\n  cursor: pointer;\n  overflow: hidden;\n  border-radius: 2px 2px 0 0;\n  width: ',
        'px;\n  min-height: ',
        'px;\n',
      ]
    )),
  StandardNodeWidth,
  HeaderHeight
);
export var CardContainerCSS = css(
  templateObject_7 ||
    (templateObject_7 = __makeTemplateObject(
      ['\n  ', ';\n  background-color: white;\n  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);\n'],
      ['\n  ', ';\n  background-color: white;\n  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);\n']
    )),
  containerCSS
);
export var DisabledCardContainerCSS = css(
  templateObject_8 || (templateObject_8 = __makeTemplateObject(['\n  ', ';\n  ', ';\n'], ['\n  ', ';\n  ', ';\n'])),
  CardContainerCSS,
  DisabledContainer
);
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7,
  templateObject_8;
//# sourceMappingURL=CardTemplateStyle.js.map
