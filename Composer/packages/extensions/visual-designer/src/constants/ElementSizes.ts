// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const StandardNodeWidth = 300;
export const StandardSectionHeight = 30;
export const HeaderHeight = StandardSectionHeight;

export const InitNodeSize = {
  width: StandardNodeWidth,
  height: StandardSectionHeight * 2,
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

export const TerminatorSize = { width: 16, height: 16 };

export const ChoiceInputSize = {
  width: 155,
  height: 22,
};

export const ChoiceInputMarginTop = 8;
export const ChoiceInputMarginBottom = 10;

export const PropertyAssignmentSize = {
  width: 155,
  height: 16,
};

export const AssignmentMarginTop = 8;
export const AssignmentMarginBottom = 8;

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

export const BranchIntervalX = ElementInterval.x;
export const BranchIntervalY = ElementInterval.y / 2;

// Preserve enough space for condition text on an edge.
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
