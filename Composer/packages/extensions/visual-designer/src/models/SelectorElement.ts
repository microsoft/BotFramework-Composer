// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AttrNames } from '../constants/ElementAttributes';
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
