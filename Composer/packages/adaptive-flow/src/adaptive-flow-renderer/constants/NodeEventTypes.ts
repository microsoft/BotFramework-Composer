// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum NodeEventTypes {
  Focus = 'event.view.focus',
  CtrlClick = 'event.view.ctrl-click',
  ShiftClick = 'event.view.shift-click',
  FocusEvent = 'event.view.focus-event',
  MoveCursor = 'event.view.move-cursor',
  OpenDialog = 'event.nav.opendialog',
  Delete = 'event.data.delete',
  Insert = 'event.data.insert',
  CopySelection = 'event.data.copy-selection',
  CutSelection = 'event.data.cut-selection',
  PasteSelection = 'event.data.paste-selection',
  MoveSelection = 'event.data.move-selection',
  DeleteSelection = 'event.data.delete-selection',
  DisableSelection = 'event.data.disable-selection',
  EnableSelection = 'event.data.enable-selection',
  AppendSelection = 'event.data.paste-selection--keyboard',
  InsertSelection = 'event.data.paste-selection--menu',
  Undo = 'event.operation.undo',
  Redo = 'event.operation.redo',
}

export type ExternalAction = { eventType?: NodeEventTypes; eventData?: { kind: string } };

export type EditorEventHandler = (eventType: NodeEventTypes, eventData: any) => any;
