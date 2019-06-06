export const InitNodeSize = {
  width: 280,
  height: 80,
};

export const EventNodeSize = {
  width: 180,
  height: 32,
};

export const CollapsedEventNodeSize = {
  width: 180,
  height: 4,
};

export const ElementInterval = {
  x: 50,
  y: 60,
};

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
  maxWidth: (EventNodeSize.width + EventNodeLayout.marginX) * 5 + 24 * 2,
  defaultWidth: (EventNodeSize.width + EventNodeLayout.marginX) * 3 + 24 * 2,
  maxHeight: (EventNodeSize.height + EventNodeLayout.marginY) * 3 + 44 + 24 + 12 + 2, // title: 44, padding: 24 + 12, border: 2
};
