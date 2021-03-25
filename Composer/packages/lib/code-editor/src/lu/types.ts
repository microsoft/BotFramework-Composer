// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const toolbarSupportedLuEntityTypes = ['prebuilt', 'ml', 'list', 'composite', 'regex'] as const;
export type ToolbarLuEntityType = typeof toolbarSupportedLuEntityTypes[number];
export type LuToolbarButtonKind = 'useEntity' | 'defineEntity' | 'tagEntity';
