// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const toolbarSupportedLuEntityTypes = ['prebuilt', 'ml', 'list', 'composite', 'regex'] as const;
export type ToolbarLuEntityType = typeof toolbarSupportedLuEntityTypes[number];
export type LuToolbarButtonKind = 'useEntity' | 'defineEntity';

type CommonEntity = {
  entityType: ToolbarLuEntityType;
};

export type ListEntityItem = {
  id: number;
  normalizedValue: string;
  synonyms: string[];
};

export type ListEntity = CommonEntity & {
  entityType: 'list';
  name: string;
  items: ListEntityItem[];
};

// This type can be expanded to other types of entities
export type Entity = ListEntity;
