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
import get from 'lodash/get';
import { LinkBtn } from '@bfc/ui-shared';
import { useEffect, useContext, useRef } from 'react';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { AttrNames, LinkTag } from '../constants/ElementAttributes';
import { SelectionContext } from '../store/SelectionContext';
export var DialogRef = function (_a) {
  var id = _a.id,
    onEvent = _a.onEvent,
    dialog = _a.dialog,
    getRefContent = _a.getRefContent;
  var linkBtnRef = useRef(null);
  var selectedIds = useContext(SelectionContext).selectedIds;
  var nodeSelected = selectedIds.includes('' + id + LinkTag);
  var declareElementAttributes = function (id) {
    var _a;
    return (
      (_a = {}),
      (_a[AttrNames.SelectableElement] = true),
      (_a[AttrNames.InlineLinkElement] = true),
      (_a[AttrNames.SelectedId] = '' + id + LinkTag),
      _a
    );
  };
  useEffect(function () {
    var _a;
    if (nodeSelected) {
      (_a = linkBtnRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    }
  });
  var calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;
  var dialogRef = calleeDialog
    ? jsx(
        LinkBtn,
        __assign(
          {
            componentRef: linkBtnRef,
            onClick: function (e) {
              e.stopPropagation();
              onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
            },
          },
          declareElementAttributes(id)
        ),
        calleeDialog
      )
    : null;
  return typeof getRefContent === 'function' ? getRefContent(dialogRef) : dialogRef;
};
//# sourceMappingURL=DialogRef.js.map
