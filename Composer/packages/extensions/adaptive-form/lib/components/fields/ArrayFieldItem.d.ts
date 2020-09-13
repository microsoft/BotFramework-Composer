import React from 'react';
import { FieldProps } from '@bfc/extension';
interface ArrayFieldItemProps extends FieldProps {
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  stackArrayItems?: boolean;
  onReorder: (aIdx: number) => void;
  onRemove: () => void;
}
declare const ArrayFieldItem: React.FC<ArrayFieldItemProps>;
export { ArrayFieldItem };
//# sourceMappingURL=ArrayFieldItem.d.ts.map
