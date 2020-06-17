// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { DialogGroup, getDialogGroupByType } from '@bfc/shared';
import { NodeColors } from '../constants/ElementColors';
export function getElementColor($kind) {
  var nodeGroup = getDialogGroupByType($kind);
  if (NodeColors[nodeGroup]) {
    return NodeColors[nodeGroup];
  } else {
    return NodeColors[DialogGroup.STEP];
  }
}
export var ElementIcon;
(function (ElementIcon) {
  ElementIcon['MessageBot'] = 'MessageBot';
  ElementIcon['User'] = 'User';
  ElementIcon['Friend'] = 'Friend';
  ElementIcon['Play'] = 'Play';
  ElementIcon['Flow'] = 'Flow';
  ElementIcon['None'] = 'None';
})(ElementIcon || (ElementIcon = {}));
export function getElementIcon($kind) {
  var dialgGroup = getDialogGroupByType($kind);
  return dialgGroup === 'Response' ? ElementIcon.MessageBot : ElementIcon.None;
}
//# sourceMappingURL=obiPropertyResolver.js.map
