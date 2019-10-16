// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum AttrNames {
  // attrs for cursor move
  SelectableElement = 'data-is-selectable',
  NodeElement = 'data-is-node',
  EdgeMenuElement = 'data-is-edge-menu',
  FocusedId = 'data-focused-id',
  SelectedId = 'data-selected-id',
  Tab = 'data-tab',

  // attrs for multi selection
  FocusableElement = 'data-is-focusable',
  SelectionIndex = 'data-selection-index',
}

export class AbstractSelectorElement {
  bounds: DOMRect;
  [AttrNames.SelectableElement]: string | undefined;
  [AttrNames.NodeElement]: string | undefined;
  [AttrNames.EdgeMenuElement]: string | undefined;
  [AttrNames.FocusedId]: string | undefined;
  [AttrNames.SelectedId]: string | undefined;
  [AttrNames.Tab]: string | undefined;

  constructor(element: HTMLElement) {
    this.bounds = element.getBoundingClientRect() as DOMRect;

    Object.keys(AttrNames).forEach(key => {
      this[AttrNames[key]] = element.getAttribute(AttrNames[key]);
    });
  }

  getAttribute(attrName) {
    return this[attrName];
  }

  getBoundingClientRect() {
    return this.bounds;
  }
}
