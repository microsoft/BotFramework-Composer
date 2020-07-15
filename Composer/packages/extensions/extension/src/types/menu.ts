// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

type SubmenuOptions = string[];

export type MenuSchema = {
  label?: string;
  submenu?: SubmenuOptions | SubmenuOptions[] | false;
};
