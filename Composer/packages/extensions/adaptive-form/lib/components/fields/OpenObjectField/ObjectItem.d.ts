import React from 'react';
import { FieldProps } from '@bfc/extension';
interface ObjectItemProps extends FieldProps {
  name: string;
  formData: object;
  stackedLayout?: boolean;
  onNameChange: (name: string) => void;
  onDelete: () => void;
}
declare const ObjectItem: React.FC<ObjectItemProps>;
export { ObjectItem };
//# sourceMappingURL=ObjectItem.d.ts.map
