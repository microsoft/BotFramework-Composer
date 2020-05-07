import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DialogGroup } from '@bfc/shared';
import { FormMemory } from '../types';
export interface DialogOptionsOpts {
  /** Used to filter individual types from the result. Default: () => true */
  filter?: (type: string) => boolean | void;
  /** Include only specific categories, if undefined, all categories are included. Default: undefined */
  include?: DialogGroup[];
  /** Exclude specific categories. Default: undefined */
  exclude?: DialogGroup[];
  /** Hide types in sub menus. Default: true */
  subMenu?: boolean;
  /** Returns non-nested options for usage in dropdown. Default: false */
  asDropdown?: boolean;
  onClick?: (e: any, item: IContextualMenuItem) => void;
}
/**
 * This method is used to build out the content of many popout menus in the form view
 * like context menus, "+Add" buttons and others.
 * @param opts
 */
export declare function buildDialogOptions(opts?: DialogOptionsOpts): IContextualMenuItem[];
export declare function swap<T = any>(arr: T[], a: number, b: number): T[];
export declare function remove<T = any>(arr: T[], i: number): T[];
export declare function insertAt<T = any>(arr: T[], item: T, idx: number): T[];
export declare function getMemoryOptions(memory?: FormMemory): IDropdownOption[];
declare type FormUpdater<T> = (updates: Partial<T>) => void;
export declare function useFormState<T extends object>(initialData?: T): [T, FormUpdater<T>];
export declare function sweepUndefinedFields(fields: any): {};
export declare function overriddenFieldsTemplate(
  fieldOverrides: any
): {
  title: any;
  description: any;
};
export declare function setOverridesOnField(formContext: any, fieldName: string): {};
export {};
