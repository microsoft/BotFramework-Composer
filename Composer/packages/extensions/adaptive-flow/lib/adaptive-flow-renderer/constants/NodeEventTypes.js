// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export var NodeEventTypes;
(function (NodeEventTypes) {
  NodeEventTypes['Focus'] = 'event.view.focus';
  NodeEventTypes['CtrlClick'] = 'event.view.ctrl-click';
  NodeEventTypes['ShiftClick'] = 'event.view.shift-click';
  NodeEventTypes['FocusEvent'] = 'event.view.focus-event';
  NodeEventTypes['MoveCursor'] = 'event.view.move-cursor';
  NodeEventTypes['OpenDialog'] = 'event.nav.opendialog';
  NodeEventTypes['Delete'] = 'event.data.delete';
  NodeEventTypes['Insert'] = 'event.data.insert';
  NodeEventTypes['CopySelection'] = 'event.data.copy-selection';
  NodeEventTypes['CutSelection'] = 'event.data.cut-selection';
  NodeEventTypes['PasteSelection'] = 'event.data.paste-selection';
  NodeEventTypes['MoveSelection'] = 'event.data.move-selection';
  NodeEventTypes['DeleteSelection'] = 'event.data.delete-selection';
  NodeEventTypes['DisableSelection'] = 'event.data.disable-selection';
  NodeEventTypes['EnableSelection'] = 'event.data.enable-selection';
  NodeEventTypes['AppendSelection'] = 'event.data.paste-selection--keyboard';
  NodeEventTypes['InsertSelection'] = 'event.data.paste-selection--menu';
  NodeEventTypes['Undo'] = 'event.operation.undo';
  NodeEventTypes['Redo'] = 'event.operation.redo';
})(NodeEventTypes || (NodeEventTypes = {}));
//# sourceMappingURL=NodeEventTypes.js.map
