// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export var NodeEventTypes;
(function (NodeEventTypes) {
  NodeEventTypes['Expand'] = 'event.view.expand';
  NodeEventTypes['Focus'] = 'event.view.focus';
  NodeEventTypes['FocusEvent'] = 'event.view.focus-event';
  NodeEventTypes['OpenDialog'] = 'event.nav.opendialog';
  NodeEventTypes['Delete'] = 'event.data.delete';
  NodeEventTypes['InsertBefore'] = 'event.data.insert-before';
  NodeEventTypes['InsertAfter'] = 'event.data.insert-after';
  NodeEventTypes['Insert'] = 'event.data.insert';
  NodeEventTypes['InsertEvent'] = 'event.data.insert-event';
  NodeEventTypes['CopySelection'] = 'event.data.copy-selection';
  NodeEventTypes['CutSelection'] = 'event.data.cut-selection';
  NodeEventTypes['MoveSelection'] = 'event.data.move-selection';
  NodeEventTypes['DeleteSelection'] = 'event.data.delete-selection';
  NodeEventTypes['AppendSelection'] = 'event.data.paste-selection--keyboard';
  NodeEventTypes['InsertSelection'] = 'event.data.paste-selection--menu';
  NodeEventTypes['Undo'] = 'event.operation.undo';
  NodeEventTypes['Redo'] = 'event.operation.redo';
})(NodeEventTypes || (NodeEventTypes = {}));
//# sourceMappingURL=NodeEventTypes.js.map
