import { JSONSchema7, JSONSchema7Definition, SchemaDefinitions } from '@bfc/extension';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
export interface SchemaOption extends IDropdownOption {
  data: {
    schema: JSONSchema7;
  };
}
export declare function getOneOfOptions(
  oneOf: JSONSchema7Definition[],
  parentSchema: JSONSchema7,
  definitions?: SchemaDefinitions
): SchemaOption[];
export declare function getOptions(schema: JSONSchema7, definitions: any): SchemaOption[];
export declare function getSelectedOption(value: any | undefined, options: SchemaOption[]): SchemaOption | undefined;
//# sourceMappingURL=utils.d.ts.map
