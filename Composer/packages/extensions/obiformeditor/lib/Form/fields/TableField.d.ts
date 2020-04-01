import React from 'react';
import { JSONSchema6 } from 'json-schema';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MicrosoftIDialog } from '@bfc/shared';
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { DialogOptionsOpts } from '../utils';
import { FormContext } from '../types';
interface TableRenderProps<T> {
  createNewItemAtIndex: (idx?: number) => (e: any, item: IContextualMenuItem) => void;
  onChange: (newItem: T | T[]) => void;
}
interface TableFieldProps<T extends MicrosoftIDialog = MicrosoftIDialog> extends FieldProps<T[]> {
  additionalColumns?: IColumn[];
  columnHeader?: string;
  formContext: FormContext;
  formData: T[];
  navPrefix: string;
  onChange: (items: T[]) => void;
  renderTitle?: (item: T) => string;
  renderDescription?: (item: T) => string;
  name: string;
  schema: JSONSchema6;
  dialogOptionsOpts?: DialogOptionsOpts;
  children?: (props: TableRenderProps<T>) => React.ReactNode;
}
export declare function TableField<T extends MicrosoftIDialog = MicrosoftIDialog>(
  props: TableFieldProps<T>
): JSX.Element;
export declare namespace TableField {
  var defaultProps: {
    additionalColumns: never[];
    formData: never[];
    navPrefix: string;
    onChange: () => void;
    renderTitle: (item: any) => any;
    renderDescription: (item: any) => any;
  };
}
export {};
//# sourceMappingURL=TableField.d.ts.map
