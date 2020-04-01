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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { WidgetLabel } from '../../../widgets/WidgetLabel';
import { StaticChoices } from './StaticChoices';
import { DynamicChoices } from './DynamicChoices';
export var Choices = function(props) {
  var id = props.id,
    label = props.label,
    formContext = props.formContext,
    formData = props.formData,
    onChange = props.onChange,
    _a = props.schema.oneOf,
    oneOf = _a === void 0 ? [] : _a;
  var dynamicSchema = oneOf[0];
  var options = useMemo(
    function() {
      return oneOf.map(function(_a) {
        var _b = _a.title,
          title = _b === void 0 ? '' : _b;
        return { key: title.toLowerCase(), text: title };
      });
    },
    [oneOf]
  );
  var _b = useState(Array.isArray(formData || []) ? 'static' : 'dynamic'),
    choiceType = _b[0],
    setChoiceType = _b[1];
  var handleChange = useCallback(
    function(_, _a) {
      var key = _a.key;
      onChange(choiceType !== 'static' ? [] : '');
      setChoiceType(key);
    },
    [choiceType, onchange, setChoiceType]
  );
  useEffect(
    function() {
      setChoiceType(
        Array.isArray(formData !== null && formData !== void 0 ? formData : []) && typeof formData !== 'string'
          ? 'static'
          : 'dynamic'
      );
    },
    [formData]
  );
  return jsx(
    React.Fragment,
    null,
    jsx(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', padding: '5px 0' } },
      jsx(WidgetLabel, {
        label: label,
        description:
          formatMessage('A list of options to present to the user.') +
          (choiceType === 'static'
            ? formatMessage(" Synonyms can be used to allow for variation in a user's response.")
            : ''),
        id: id,
      }),
      options.length > 0 &&
        jsx(Dropdown, {
          styles: {
            caretDownWrapper: { height: '24px', lineHeight: '24px' },
            root: { padding: '7px 0', width: '100px' },
            title: { height: '24px', lineHeight: '20px' },
          },
          onChange: handleChange,
          options: options,
          selectedKey: choiceType,
          responsiveMode: ResponsiveMode.large,
        })
    ),
    !options || choiceType === 'static'
      ? jsx(StaticChoices, __assign({}, props))
      : jsx(DynamicChoices, __assign({}, props, { formContext: formContext, schema: dynamicSchema }))
  );
};
//# sourceMappingURL=Choices.js.map
