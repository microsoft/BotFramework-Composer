import { FieldProps, JSONSchema7, JSONSchema7Definition } from '@bfc/extension';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
export declare function getOptions(
  schema: JSONSchema7,
  definitions?: {
    [key: string]: JSONSchema7Definition;
  }
): IDropdownOption[];
export declare function getSelectedOption(
  value: any | undefined,
  options: IDropdownOption[]
): IDropdownOption | undefined;
export declare function getFieldProps(props: FieldProps, schema?: JSONSchema7): FieldProps;
//# sourceMappingURL=utils.d.ts.map
