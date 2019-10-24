import { WidgetProps, FieldProps, ObjectFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import { ShellData, EditorSchema, ShellApi, OBISchema } from 'shared';

export interface FormContext
  extends Pick<ShellData, 'luFiles' | 'lgFiles' | 'currentDialog' | 'focusedEvent' | 'focusedSteps' | 'focusedTab'> {
  editorSchema: EditorSchema;
  shellApi: ShellApi;
  rootId: string;
  dialogOptions: { value: string; label: string }[];
  dialogId?: string;
  isRoot: boolean;
}

interface EnumOption {
  label: string;
  value: string;
}

export interface BFDObjectFieldTemplateProps extends ObjectFieldTemplateProps {
  id: string;
  onChange: (any) => void;
}

export interface BFDFieldProps<T = any> extends FieldProps<T> {
  formContext: FormContext;
}

export interface BFDWidgetProps extends Partial<WidgetProps> {
  id: string;
  schema: OBISchema;
  onChange: (data: any) => void;
  formContext: FormContext;
  options?: {
    label?: string | false;
    enumOptions?: EnumOption[];
  };
}

export interface SelectWidgetProps extends BFDWidgetProps {
  options: {
    enumOptions: EnumOption[];
  };
}

export interface RadioWidgetProps extends BFDWidgetProps {
  options: {
    enumOptions: EnumOption[];
  };
}
