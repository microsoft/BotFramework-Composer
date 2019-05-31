import {
  DropdownMenuItemType,
  IContextualMenuItem,
  ContextualMenuItemType,
  IDropdownOption,
} from 'office-ui-fabric-react';
import { useState } from 'react';
import merge from 'lodash.merge';
import get from 'lodash.get';

import { dialogGroups, DialogGroup, DialogGroupItem } from '../schema/appschema';
import { FormMemory, MemoryScope } from '../types';

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

export function buildDialogOptions(opts: DialogOptionsOpts = {}): IContextualMenuItem[] {
  const { filter = () => true, include, exclude, subMenu = true, onClick, asDropdown = false } = opts;
  let menuOptions: IContextualMenuItem[] = [];

  const filteredGroups = Object.keys(dialogGroups).reduce<DialogGroupItem[]>((filtered, group) => {
    let includeGroup = true;

    if (include) {
      includeGroup = include.includes(group as DialogGroup);
    }

    if (exclude) {
      includeGroup = !exclude.includes(group as DialogGroup);
    }

    if (includeGroup) {
      filtered.push(dialogGroups[group]);
    }
    return filtered;
  }, []);

  const handleClick = (e, item) => {
    if (onClick && item) {
      onClick(e as any, item);
    }
  };

  for (const group of filteredGroups) {
    const dialogOpts = group.types.filter(filter).map(dialog => ({
      key: dialog,
      text: dialog,
      data: {
        $type: dialog,
      },
      onClick: subMenu ? undefined : handleClick,
    }));

    if (subMenu && !asDropdown) {
      const header: IContextualMenuItem = {
        key: group.label,
        text: group.label,
        subMenuProps: {
          items: dialogOpts,
          onItemClick: handleClick,
        },
      };
      menuOptions.push(header);
    } else {
      menuOptions = menuOptions.concat(dialogOpts);
    }
    menuOptions.push({ key: `${group.label}_divider`, text: '-', itemType: ContextualMenuItemType.Divider });
  }

  return menuOptions;
}

export function swap<T = any>(arr: T[], a: number, b: number): T[] {
  const newArr = [...arr];
  const tmp = newArr[a];

  newArr[a] = newArr[b];
  newArr[b] = tmp;

  return newArr;
}

export function remove<T = any>(arr: T[], i: number): T[] {
  const newArr = [...arr];
  newArr.splice(i, 1);
  return newArr;
}

export function insertAt<T = any>(arr: T[], item: T, idx: number): T[] {
  const newArr = [...arr];

  if (idx <= 0) {
    newArr.splice(0, 0, item);
  } else {
    newArr.splice(idx, 0, item);
  }

  return newArr;
}

function getOptions(memory: FormMemory, scope: MemoryScope): IDropdownOption[] {
  const options: IDropdownOption[] = [];
  for (const key in memory[scope]) {
    options.push({ key: `${scope}.${key}`, text: `${memory[scope][key]}` });
  }
  return options;
}

function buildScope(memory: FormMemory, scope: MemoryScope): IDropdownOption[] {
  if (!memory || !memory[scope]) return [];

  const options = getOptions(memory, scope);

  if (options.length === 0) return [];

  return [
    { key: scope, text: scope.toUpperCase(), itemType: DropdownMenuItemType.Header },
    ...options,
    { key: `${scope}_divider`, text: '-', itemType: DropdownMenuItemType.Divider },
  ];
}

export function getMemoryOptions(memory: FormMemory): IDropdownOption[] {
  return [
    ...buildScope(memory, MemoryScope.user),
    ...buildScope(memory, MemoryScope.conversation),
    ...buildScope(memory, MemoryScope.dialog),
    ...buildScope(memory, MemoryScope.turn),
  ];
}

type FormUpdater<T> = (updates: Partial<T>) => void;

export function useFormState<T extends object>(initialData?: T): [T, FormUpdater<T>] {
  // @ts-ignore
  const defaultFormState: T = {};
  const [formData, setFormData] = useState<T>(initialData || defaultFormState);

  const update: FormUpdater<T> = updates => {
    setFormData(merge({}, formData, updates));
  };

  return [formData, update];
}

export function getTimestamp(): string {
  return new Date().toISOString();
}

export function sweepUndefinedFields(fields) {
  const definedFields = {};

  for (const elem in fields) {
    if (fields[elem] !== null && fields[elem] !== undefined) {
      definedFields[elem] = fields[elem];
    }
  }

  return definedFields;
}

export function overriddenFieldsTemplate(fieldOverrides) {
  return {
    name: fieldOverrides.name,
    description: fieldOverrides.description,
  };
}

export function setOverridesOnField(formContext: any, fieldName: string) {
  const templateOverrides = get(formContext.editorSchema, `content.fieldTemplateOverrides.${fieldName}`);
  const overrides = overriddenFieldsTemplate(templateOverrides);
  return sweepUndefinedFields(overrides);
}
