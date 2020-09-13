// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var _a;
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import React from 'react';
import get from 'lodash/get';
import { FixedInfo, SingleLineDiv, ListOverview, PropertyAssignment } from '@bfc/ui-shared';
import { ObiColors } from '../constants/ElementColors';
var BaseInputSchema = {
  widget: 'ActionCard',
  body: function (data) {
    return data.prompt;
  },
};
var builtinVisualSDKSchema =
  ((_a = {
    default: {
      widget: 'ActionHeader',
    },
    custom: {
      widget: 'ActionHeader',
      colors: { theme: ObiColors.Gray20, color: ObiColors.White },
    },
  }),
  (_a[SDKKinds.IfCondition] = {
    widget: 'IfConditionWidget',
    nowrap: true,
    judgement: {
      widget: 'ActionCard',
      body: function (data) {
        return data.condition;
      },
    },
  }),
  (_a[SDKKinds.SwitchCondition] = {
    widget: 'SwitchConditionWidget',
    nowrap: true,
    judgement: {
      widget: 'ActionCard',
      body: function (data) {
        return data.condition;
      },
    },
  }),
  (_a[SDKKinds.Foreach] = {
    widget: 'ForeachWidget',
    nowrap: true,
    loop: {
      widget: 'ActionCard',
      body: function (data) {
        return formatMessage('Each value in') + ' {' + (data.itemsProperty || '?') + '}';
      },
    },
  }),
  (_a[SDKKinds.ForeachPage] = {
    widget: 'ForeachWidget',
    nowrap: true,
    loop: {
      widget: 'ActionCard',
      body: function (data) {
        var pageSizeString = get(data, 'pageSize', '?');
        var propString = get(data, 'itemsProperty', '?');
        return formatMessage('Each page of {pageSizeString} in {propString}', {
          pageSizeString: pageSizeString,
          propString: propString,
        });
      },
    },
  }),
  (_a[SDKKinds.SendActivity] = {
    widget: 'ActionCard',
    body: function (data) {
      return data.activity;
    },
  }),
  (_a[SDKKinds.AttachmentInput] = BaseInputSchema),
  (_a[SDKKinds.ConfirmInput] = BaseInputSchema),
  (_a[SDKKinds.DateTimeInput] = BaseInputSchema),
  (_a[SDKKinds.NumberInput] = BaseInputSchema),
  (_a[SDKKinds.TextInput] = BaseInputSchema),
  (_a[SDKKinds.ChoiceInput] = BaseInputSchema),
  (_a[SDKKinds.BeginDialog] = {
    widget: 'ActionCard',
    body: {
      widget: 'DialogRef',
      dialog: function (data) {
        return data.dialog;
      },
      getRefContent: function (data) {
        return function (dialogRef) {
          return React.createElement(
            React.Fragment,
            null,
            dialogRef || '?',
            ' ',
            React.createElement(FixedInfo, null, formatMessage('(Dialog)'))
          );
        };
      },
    },
    footer: function (data) {
      return data.property
        ? React.createElement(
            React.Fragment,
            null,
            data.property,
            ' ',
            React.createElement(FixedInfo, null, formatMessage('= Return value'))
          )
        : null;
    },
  }),
  (_a[SDKKinds.BeginSkill] = {
    widget: 'ActionCard',
    colors: { theme: ObiColors.DarkBlue, color: ObiColors.White, icon: ObiColors.White },
    icon: 'Library',
    body: function (data) {
      return React.createElement(
        SingleLineDiv,
        null,
        React.createElement(FixedInfo, null, formatMessage('Host ')),
        data.skillEndpoint || '?'
      );
    },
    footer: function (data) {
      return data.resultProperty
        ? React.createElement(
            React.Fragment,
            null,
            data.resultProperty,
            React.createElement(FixedInfo, null, formatMessage(' = Result'))
          )
        : null;
    },
  }),
  (_a[SDKKinds.ReplaceDialog] = {
    widget: 'ActionCard',
    body: {
      widget: 'DialogRef',
      dialog: function (data) {
        return data.dialog;
      },
      getRefContent: function (data) {
        return function (dialogRef) {
          return React.createElement(
            React.Fragment,
            null,
            dialogRef || '?',
            ' ',
            React.createElement(FixedInfo, null, formatMessage('(Dialog)'))
          );
        };
      },
    },
  }),
  (_a[SDKKinds.EditArray] = {
    widget: 'ActionCard',
    body: function (data) {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(FixedInfo, null, data.changeType || '?'),
        ' ',
        data.itemsProperty || '?'
      );
    },
    footer: function (data) {
      return data.resultProperty
        ? React.createElement(
            React.Fragment,
            null,
            data.resultProperty,
            React.createElement(FixedInfo, null, formatMessage(' = Result'))
          )
        : null;
    },
  }),
  (_a[SDKKinds.SetProperty] = {
    widget: 'ActionCard',
    body: function (data) {
      return React.createElement(PropertyAssignment, { property: data.property, value: data.value });
    },
  }),
  (_a[SDKKinds.SetProperties] = {
    widget: 'ActionCard',
    body: function (data) {
      return React.createElement(ListOverview, {
        itemPadding: 8,
        items: data.assignments,
        renderItem: function (_a) {
          var property = _a.property,
            value = _a.value;
          return React.createElement(PropertyAssignment, { property: property, value: value });
        },
      });
    },
  }),
  (_a[SDKKinds.DeleteActivity] = {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Delete activity',
    },
    body: function (data) {
      return React.createElement(React.Fragment, null, React.createElement(FixedInfo, null, data.activityId || '?'));
    },
  }),
  (_a[SDKKinds.UpdateActivity] = {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Update activity',
    },
    body: function (data) {
      return data.activity;
    },
  }),
  (_a[SDKKinds.DeleteProperty] = {
    widget: 'ActionCard',
    body: function (data) {
      return data.property;
    },
  }),
  (_a[SDKKinds.DeleteProperties] = {
    widget: 'ActionCard',
    body: function (data) {
      return React.createElement(ListOverview, {
        itemPadding: 8,
        items: data.properties,
        renderItem: function (item) {
          return React.createElement(SingleLineDiv, { height: 16, title: item }, item);
        },
      });
    },
  }),
  (_a[SDKKinds.CancelAllDialogs] = {
    widget: 'ActionCard',
    body: function (data) {
      return data.eventName
        ? React.createElement(
            React.Fragment,
            null,
            data.eventName || '?',
            React.createElement(FixedInfo, null, formatMessage(' (Event)'))
          )
        : null;
    },
  }),
  (_a[SDKKinds.EmitEvent] = {
    widget: 'ActionCard',
    body: function (data) {
      return React.createElement(
        React.Fragment,
        null,
        data.eventName || '?',
        React.createElement(FixedInfo, null, formatMessage(' (Event)'))
      );
    },
  }),
  (_a[SDKKinds.HttpRequest] = {
    widget: 'ActionCard',
    body: function (data) {
      return React.createElement(SingleLineDiv, null, React.createElement(FixedInfo, null, data.method, ' '), data.url);
    },
    footer: function (data) {
      return data.resultProperty
        ? React.createElement(
            React.Fragment,
            null,
            data.resultProperty,
            React.createElement(FixedInfo, null, formatMessage(' = Result property'))
          )
        : null;
    },
  }),
  (_a[SDKKinds.EditActions] = {
    widget: 'ActionCard',
    body: function (data) {
      return data.changeType;
    },
  }),
  (_a[SDKKinds.QnAMakerDialog] = {
    widget: 'ActionCard',
    body: function (data) {
      return data.hostname;
    },
  }),
  (_a[SDKKinds.OAuthInput] = {
    widget: 'ActionCard',
    body: function (data) {
      return React.createElement(SingleLineDiv, null, data.connectionName);
    },
    footer: function (data) {
      return data.tokenProperty
        ? React.createElement(
            React.Fragment,
            null,
            data.tokenProperty,
            React.createElement(FixedInfo, null, formatMessage(' = Token Property'))
          )
        : null;
    },
  }),
  (_a[SDKKinds.TelemetryTrackEvent] = {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Telemetry - Trace Event',
    },
    body: function (data) {
      return React.createElement(
        React.Fragment,
        null,
        data.eventName || '?',
        React.createElement(FixedInfo, null, formatMessage(' (Event)'))
      );
    },
  }),
  _a);
export default builtinVisualSDKSchema;
//# sourceMappingURL=builtinSchema.js.map
