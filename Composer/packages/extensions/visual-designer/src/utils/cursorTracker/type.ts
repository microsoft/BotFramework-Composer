// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AttrNames } from '../../constants/ElementAttributes';

export class SelectorElement {
  bounds: Record<string, any>;
  isSelectable: string | null;
  isNode: string | null;
  isEdgeMenu: string | null;
  isInlineLinkElement: string | null;
  focusedId: string | null;
  selectedId: string;
  tab: string | null;

  constructor(element: HTMLElement) {
    this.isSelectable = element.getAttribute(AttrNames.SelectableElement);
    this.isNode = element.getAttribute(AttrNames.NodeElement);
    this.isEdgeMenu = element.getAttribute(AttrNames.EdgeMenuElement);
    this.isInlineLinkElement = element.getAttribute(AttrNames.InlineLinkElement);
    this.focusedId = element.getAttribute(AttrNames.FocusedId);
    this.selectedId = element.getAttribute(AttrNames.SelectedId) as string;
    this.tab = element.getAttribute(AttrNames.Tab);

    const elementBounds = element.getBoundingClientRect();
    this.bounds = {
      width: elementBounds.width,
      height: elementBounds.height,
      left: elementBounds.left,
      right: elementBounds.right,
      top: elementBounds.top,
      bottom: elementBounds.bottom,
    };
  }

  hasAttribute(attrName) {
    return this[attrName];
  }
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export enum BoundRect {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

export enum Axle {
  X,
  Y,
}
