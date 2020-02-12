// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const InitNodeSize = {
  width: 200,
  height: 48,
};

export const DiamondSize = {
  width: 30,
  height: 12,
};

export const LoopIconSize = {
  width: 16,
  height: 16,
};

export const IconBrickSize = {
  width: 24,
  height: 24,
};

export const LoopEdgeMarginLeft = 20;

export const BoxMargin = 5;
export const TriggerSize = InitNodeSize;

export const TerminatorSize = { width: 14, height: 14 };

export const ChoiceInputSize = {
  width: 145,
  height: 22,
};

export const ChoiceInputMarginTop = 5;

export const EventNodeSize = {
  width: 240,
  height: 125,
};

export const CollapsedEventNodeSize = {
  width: 180,
  height: 4,
};

export const ElementInterval = {
  x: 50,
  y: 60,
};

export const BranchIntervalMinX = 150;

export const EdgeAddButtonSize = {
  width: 16,
  height: 16,
};

export const EventNodeLayout = {
  marginX: 12,
  marginY: 12,
};

export const PanelSize = {
  minWidth: (EventNodeSize.width + EventNodeLayout.marginX) * 2 + 24 * 2,
  maxWidth: (EventNodeSize.width + EventNodeLayout.marginX) * 4 + 24 * 2,
  defaultWidth: (EventNodeSize.width + EventNodeLayout.marginX) * 3 + 24 * 2,
  maxHeight: (EventNodeSize.height + EventNodeLayout.marginY) * 3 + 44 + 24 + 12 + 2, // title: 44, padding: 24 + 12, border: 2
};
