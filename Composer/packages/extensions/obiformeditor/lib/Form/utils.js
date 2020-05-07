// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
import { ContextualMenuItemType } from 'office-ui-fabric-react/lib/ContextualMenu';
import { DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';
import { useState } from 'react';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { dialogGroups, getDesignerId } from '@bfc/shared';
import { MemoryScope } from '../types';
/**
 * This method is used to build out the content of many popout menus in the form view
 * like context menus, "+Add" buttons and others.
 * @param opts
 */
export function buildDialogOptions(opts) {
  if (opts === void 0) {
    opts = {};
  }
  var _a = opts.filter,
    filter =
      _a === void 0
        ? function() {
            return true;
          }
        : _a,
    include = opts.include,
    exclude = opts.exclude,
    _b = opts.subMenu,
    subMenu = _b === void 0 ? true : _b,
    onClick = opts.onClick,
    _c = opts.asDropdown,
    asDropdown = _c === void 0 ? false : _c;
  var menuOptions = [];
  var filteredGroups = Object.keys(dialogGroups).reduce(function(filtered, group) {
    var includeGroup = true;
    if (include) {
      includeGroup = include.includes(group);
    }
    if (exclude) {
      includeGroup = !exclude.includes(group);
    }
    if (includeGroup) {
      filtered.push(dialogGroups[group]);
    }
    return filtered;
  }, []);
  var handleClick = function(e, item) {
    if (onClick && item) {
      onClick(e, item);
    }
  };
  for (var _i = 0, filteredGroups_1 = filteredGroups; _i < filteredGroups_1.length; _i++) {
    var group = filteredGroups_1[_i];
    var dialogOpts = group.types.filter(filter).map(function(dialog) {
      return {
        key: dialog,
        text: dialog,
        data: {
          $type: dialog,
          $designer: getDesignerId(),
        },
        onClick: subMenu ? undefined : handleClick,
      };
    });
    if (subMenu && !asDropdown) {
      var header = {
        key: group.label,
        text: group.label,
        subMenuProps: {
          items: dialogOpts,
          onItemClick: handleClick,
        },
      };
      menuOptions.push(header);
    } else {
      menuOptions = menuOptions.concat(dialogOpts);
    }
    menuOptions.push({ key: group.label + '_divider', text: '-', itemType: ContextualMenuItemType.Divider });
  }
  return menuOptions;
}
export function swap(arr, a, b) {
  var newArr = __spreadArrays(arr);
  var tmp = newArr[a];
  newArr[a] = newArr[b];
  newArr[b] = tmp;
  return newArr;
}
export function remove(arr, i) {
  var newArr = __spreadArrays(arr);
  newArr.splice(i, 1);
  return newArr;
}
export function insertAt(arr, item, idx) {
  var newArr = __spreadArrays(arr);
  if (idx <= 0) {
    newArr.splice(0, 0, item);
  } else {
    newArr.splice(idx, 0, item);
  }
  return newArr;
}
function getOptions(memory, scope) {
  if (!memory || !memory[scope]) return [];
  var options = [];
  for (var key in memory[scope]) {
    options.push({ key: scope + '.' + key, text: '' + memory[scope][key] });
  }
  return options;
}
function buildScope(memory, scope) {
  if (!memory || !memory[scope]) return [];
  var options = getOptions(memory, scope);
  if (options.length === 0) return [];
  return __spreadArrays([{ key: scope, text: scope.toUpperCase(), itemType: DropdownMenuItemType.Header }], options, [
    { key: scope + '_divider', text: '-', itemType: DropdownMenuItemType.Divider },
  ]);
}
export function getMemoryOptions(memory) {
  return __spreadArrays(
    buildScope(memory, MemoryScope.user),
    buildScope(memory, MemoryScope.conversation),
    buildScope(memory, MemoryScope.dialog),
    buildScope(memory, MemoryScope.turn)
  );
}
export function useFormState(initialData) {
  // @ts-ignore
  var defaultFormState = {};
  var _a = useState(initialData || defaultFormState),
    formData = _a[0],
    setFormData = _a[1];
  var update = function(updates) {
    setFormData(merge({}, formData, updates));
  };
  return [formData, update];
}
export function sweepUndefinedFields(fields) {
  var definedFields = {};
  for (var elem in fields) {
    if (fields[elem] !== null && fields[elem] !== undefined) {
      definedFields[elem] = fields[elem];
    }
  }
  return definedFields;
}
export function overriddenFieldsTemplate(fieldOverrides) {
  return {
    title: fieldOverrides.title,
    description: fieldOverrides.description,
  };
}
export function setOverridesOnField(formContext, fieldName) {
  var templateOverrides = get(formContext.editorSchema, 'content.fieldTemplateOverrides.' + fieldName);
  var overrides = overriddenFieldsTemplate(templateOverrides);
  return sweepUndefinedFields(overrides);
}
//# sourceMappingURL=utils.js.map
