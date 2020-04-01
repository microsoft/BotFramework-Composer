// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
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
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import get from 'lodash/get';
import { PromptTab } from '@bfc/shared';
import { BaseField } from '../BaseField';
import { tabs } from './styles';
import { BotAsks } from './BotAsks';
import { UserInput } from './UserInput';
import { Other } from './Other';
import { PromptSettings } from './PromptSettings';
export var PromptField = function(props) {
  var formContext = props.formContext;
  var shellApi = formContext.shellApi,
    focusedTab = formContext.focusedTab,
    focusedSteps = formContext.focusedSteps;
  var getSchema = function(field) {
    var fieldSchema = get(props.schema, ['properties', field]);
    return fieldSchema;
  };
  var updateField = function(field) {
    return function(data) {
      var _a;
      props.onChange(__assign(__assign({}, props.formData), ((_a = {}), (_a[field] = data), _a)));
    };
  };
  var handleTabChange = function(item) {
    if (item) {
      shellApi.onFocusSteps(focusedSteps, item.props.itemKey);
    }
  };
  return jsx(
    BaseField,
    __assign({}, props),
    jsx(
      Pivot,
      {
        linkSize: PivotLinkSize.large,
        styles: tabs,
        selectedKey: focusedTab || PromptTab.BOT_ASKS,
        onLinkClick: handleTabChange,
      },
      jsx(
        PivotItem,
        { headerText: formatMessage('Bot Asks'), itemKey: PromptTab.BOT_ASKS },
        jsx(BotAsks, __assign({}, props, { onChange: updateField, getSchema: getSchema }))
      ),
      jsx(
        PivotItem,
        { headerText: formatMessage('User Input'), itemKey: PromptTab.USER_INPUT },
        jsx(UserInput, __assign({}, props, { onChange: updateField, getSchema: getSchema }))
      ),
      jsx(
        PivotItem,
        { headerText: formatMessage('Other'), itemKey: PromptTab.OTHER },
        jsx(Other, __assign({}, props, { onChange: updateField, getSchema: getSchema })),
        jsx(PromptSettings, __assign({}, props, { onChange: updateField, getSchema: getSchema }))
      )
    )
  );
};
//# sourceMappingURL=index.js.map
