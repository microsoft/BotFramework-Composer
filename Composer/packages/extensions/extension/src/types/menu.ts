// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

type SubmenuGroup = {
  label?: string;
  group?: string;
  submenu?: string[] | false;
};

export type MenuSchema = SubmenuGroup | SubmenuGroup[];
