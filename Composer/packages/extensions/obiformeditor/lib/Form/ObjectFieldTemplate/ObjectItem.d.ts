import React from 'react';
import { OBISchema } from '@bfc/shared';
import { UiSchema } from '@bfcomposer/react-jsonschema-form';
import './styles.css';
interface ObjectItemProps {
  content: React.ReactNode;
  name: string;
  onDropPropertyClick: (name: string) => (e: any) => void;
  onEdit: (e: any) => void;
  onAdd: (e: any) => void;
  schema: OBISchema;
  uiSchema: UiSchema;
}
export default function ObjectItem(props: ObjectItemProps): JSX.Element | null;
export {};
//# sourceMappingURL=ObjectItem.d.ts.map
