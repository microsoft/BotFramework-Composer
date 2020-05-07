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
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { NeutralColors, FontSizes, SharedColors } from '@uifabric/fluent-theme';
import {
  field,
  choiceField,
  choiceItem,
  choiceItemContainer,
  choiceItemLabel,
  choiceItemValue,
  choiceItemValueLabel,
} from '../styles';
import { swap, remove } from '../../../utils';
import { EditableField } from '../../EditableField';
var ChoiceItem = function(props) {
  var choice = props.choice,
    index = props.index,
    onEdit = props.onEdit,
    hasMoveUp = props.hasMoveUp,
    hasMoveDown = props.hasMoveDown,
    onReorder = props.onReorder,
    onDelete = props.onDelete;
  var _a = useState(choice.value + ':' + (choice.synonyms ? choice.synonyms.join() : '')),
    key = _a[0],
    setKey = _a[1];
  var contextItems = [
    {
      key: 'moveUp',
      text: 'Move Up',
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !hasMoveUp,
      onClick: function() {
        return onReorder(index, index - 1);
      },
    },
    {
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !hasMoveDown,
      onClick: function() {
        return onReorder(index, index + 1);
      },
    },
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      onClick: function() {
        return onDelete(index);
      },
    },
  ];
  var handleEdit = function(field) {
    return function(_e, val) {
      if (field === 'synonyms') {
        onEdit(index, __assign(__assign({}, choice), { synonyms: val ? val.split(', ') : [] }));
      } else {
        onEdit(index, __assign(__assign({}, choice), { value: val }));
      }
    };
  };
  var handleBlur = function() {
    setKey(choice.value + ':' + (choice.synonyms ? choice.synonyms.join() : ''));
    if (!choice.value && (!choice.synonyms || !choice.synonyms.length)) {
      onDelete(index);
    }
  };
  return jsx(
    'div',
    { css: [choiceItemContainer(), choiceItem], key: key },
    jsx(
      'div',
      { css: choiceItemValue },
      jsx(EditableField, {
        onChange: handleEdit('value'),
        value: choice.value,
        styles: {
          root: { margin: '7px 0 7px 0' },
        },
        onBlur: handleBlur,
      })
    ),
    jsx(
      'div',
      { css: choiceItemValue },
      jsx(EditableField, {
        onChange: handleEdit('synonyms'),
        value: choice.synonyms && choice.synonyms.join(', '),
        placeholder: formatMessage('Add multiple comma-separated synonyms'),
        styles: {
          root: { margin: '7px 0 7px 0' },
        },
        options: { transparentBorder: true },
        onBlur: handleBlur,
      })
    ),
    jsx(
      'div',
      null,
      jsx(IconButton, {
        menuProps: { items: contextItems },
        menuIconProps: { iconName: 'MoreVertical' },
        ariaLabel: formatMessage('Item Actions'),
        styles: { menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } },
      })
    )
  );
};
export var StaticChoices = function(props) {
  var _a = props.formData,
    formData = _a === void 0 ? [] : _a,
    id = props.id,
    onChange = props.onChange;
  var _b = useState(null),
    newChoice = _b[0],
    setNewChoice = _b[1];
  var _c = useState(''),
    errorMsg = _c[0],
    setErrorMsg = _c[1];
  var handleReorder = function(aIdx, bIdx) {
    onChange(swap(formData, aIdx, bIdx));
  };
  var handleDelete = function(idx) {
    onChange(remove(formData, idx));
  };
  var handleEdit = function(idx, val) {
    var choices = __spreadArrays(formData || []);
    choices[idx] = val;
    onChange(choices);
  };
  var handleNewChoiceEdit = function(field) {
    return function(_e, data) {
      if (field === 'synonyms') {
        setNewChoice(__assign(__assign({}, newChoice), { synonyms: data ? data.split(', ') : [] }));
      } else {
        setNewChoice(__assign(__assign({}, newChoice), { value: data }));
      }
    };
  };
  var handleKeyDown = function(e) {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      if (newChoice) {
        if (newChoice.value) {
          onChange(__spreadArrays(formData, [newChoice]));
          setNewChoice(null);
          setErrorMsg('');
        } else {
          setErrorMsg(formatMessage('value required'));
        }
      }
    }
  };
  return jsx(
    'div',
    null,
    jsx(
      'div',
      { css: [choiceItemContainer('flex-start'), choiceItemLabel] },
      jsx('div', { css: [choiceItemValue, choiceItemValueLabel] }, formatMessage('Choice Name')),
      jsx('div', { css: [choiceItemValue, choiceItemValueLabel] }, formatMessage('Synonyms (Optional)'))
    ),
    jsx(
      'div',
      { css: choiceField },
      Array.isArray(formData) &&
        formData.map(function(c, i) {
          return jsx(ChoiceItem, {
            key: i + '-' + formData.length,
            choice: c,
            index: i,
            onEdit: handleEdit,
            onReorder: handleReorder,
            onDelete: handleDelete,
            hasMoveDown: i !== formData.length - 1,
            hasMoveUp: i !== 0,
          });
        })
    ),
    jsx(
      'div',
      { css: field },
      jsx(
        'div',
        { css: choiceItemContainer('flex-start'), onKeyDown: handleKeyDown },
        jsx(
          'div',
          { css: choiceItemValue },
          jsx(TextField, {
            id: id,
            value: newChoice ? newChoice.value : '',
            onChange: handleNewChoiceEdit('value'),
            placeholder: formatMessage('Add new option here'),
            autoComplete: 'off',
            errorMessage: errorMsg,
          })
        ),
        jsx(
          'div',
          { css: choiceItemValue },
          jsx(TextField, {
            id: id + '-synonyms',
            value: newChoice ? (newChoice.synonyms || []).join(', ') : '',
            onChange: handleNewChoiceEdit('synonyms'),
            placeholder: formatMessage('Add multiple comma-separated synonyms '),
            autoComplete: 'off',
            iconProps: {
              iconName: 'ReturnKey',
              style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
            },
          })
        ),
        jsx(
          'div',
          null,
          jsx(IconButton, {
            disabled: true,
            menuIconProps: { iconName: 'MoreVertical' },
            ariaLabel: formatMessage('Item Actions'),
            styles: {
              menuIcon: {
                backgroundColor: NeutralColors.white,
                color: NeutralColors.gray130,
                fontSize: FontSizes.size16,
              },
              rootDisabled: {
                backgroundColor: NeutralColors.white,
              },
            },
          })
        )
      )
    )
  );
};
//# sourceMappingURL=StaticChoices.js.map
