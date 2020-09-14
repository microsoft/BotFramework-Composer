'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.CompletionElement = void 0;
var tslib_1 = require('tslib');
/** @jsx jsx */
var core_1 = require('@emotion/core');
var monaco_languageclient_1 = require('monaco-languageclient');
var Icon_1 = require('office-ui-fabric-react/lib/Icon');
var Tooltip_1 = require('office-ui-fabric-react/lib/Tooltip');
var react_1 = tslib_1.__importDefault(require('react'));
var styles = {
  completionElement: core_1.css(
    templateObject_1 ||
      (templateObject_1 = tslib_1.__makeTemplateObject(
        [
          '\n    height: 32px;\n    cursor: pointer;\n    padding: 0 4px;\n    width: 100%;\n    display: flex;\n    align-items: center;\n  ',
        ],
        [
          '\n    height: 32px;\n    cursor: pointer;\n    padding: 0 4px;\n    width: 100%;\n    display: flex;\n    align-items: center;\n  ',
        ]
      ))
  ),
  selectedElement: core_1.css(
    templateObject_2 ||
      (templateObject_2 = tslib_1.__makeTemplateObject(
        ['\n    background-color: #ddd;\n  '],
        ['\n    background-color: #ddd;\n  ']
      ))
  ),
  text: core_1.css(
    templateObject_3 ||
      (templateObject_3 = tslib_1.__makeTemplateObject(['\n    font-size: 15px;\n  '], ['\n    font-size: 15px;\n  ']))
  ),
  icon: core_1.css(
    templateObject_4 ||
      (templateObject_4 = tslib_1.__makeTemplateObject(
        ['\n    margin-right: 5px;\n  '],
        ['\n    margin-right: 5px;\n  ']
      ))
  ),
};
var getIconName = function (kind) {
  switch (kind) {
    case monaco_languageclient_1.CompletionItemKind.Function:
      return 'Variable';
    case monaco_languageclient_1.CompletionItemKind.Variable:
      return 'VariableGroup';
    case monaco_languageclient_1.CompletionItemKind.Enum:
      return 'BulletedList';
    default:
      return '';
  }
};
// You can check out Fuse.js documentation to understand the types: https://fusejs.io/api/options.html.
// Matches is an array of "match" (m). Each match has a start index and end index.
var renderMatch = function (match, segmentIndex) {
  var firstIndex = 0;
  var lastIndex = match.value.length;
  var items = match.indices.map(function (m, spanIndex) {
    var firstSpan = core_1.jsx('span', null, match.value.slice(firstIndex, m[0]));
    var secondSpan = core_1.jsx('span', { style: { color: 'blue' } }, match.value.slice(m[0], m[1] + 1));
    firstIndex = m[1] + 1;
    return core_1.jsx(
      react_1.default.Fragment,
      { key: 'segment-' + segmentIndex + '-span-' + spanIndex },
      firstSpan,
      secondSpan
    );
  });
  items.push(
    core_1.jsx('span', { key: 'segment-' + segmentIndex + '-span-final' }, match.value.slice(firstIndex, lastIndex))
  );
  return core_1.jsx(react_1.default.Fragment, { key: 'segment-' + segmentIndex }, items);
};
var renderLabelWithCharacterHighlights = function (matches) {
  return core_1.jsx(react_1.default.Fragment, null, ' ', matches.map(renderMatch), ' ');
};
var renderDocumentation = function (documentation) {
  return core_1.jsx('span', null, documentation);
};
exports.CompletionElement = function (props) {
  var completionItem = props.completionItem,
    isSelected = props.isSelected,
    onClickCompletionItem = props.onClickCompletionItem;
  var additionalStyles = isSelected ? styles.selectedElement : {};
  var renderItem = function () {
    return core_1.jsx(
      'div',
      { css: [styles.completionElement, additionalStyles], onClick: onClickCompletionItem },
      core_1.jsx(Icon_1.FontIcon, { iconName: getIconName(completionItem.kind), css: styles.icon }),
      core_1.jsx(
        'div',
        { css: styles.text },
        completionItem.data.matches
          ? renderLabelWithCharacterHighlights(completionItem.data.matches)
          : completionItem.label
      )
    );
  };
  return completionItem.documentation
    ? core_1.jsx(
        Tooltip_1.TooltipHost,
        {
          content: renderDocumentation(completionItem.documentation),
          directionalHint: Tooltip_1.DirectionalHint.rightCenter,
        },
        renderItem()
      )
    : renderItem();
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=CompletionElement.js.map
