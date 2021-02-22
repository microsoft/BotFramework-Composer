// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Diagnostic } from '@bfc/shared';

export type TreeLink = {
  displayName: string;
  isRoot: boolean;
  isRemote: boolean;
  diagnostics: Diagnostic[];
  projectId: string;
  skillId?: string;
  dialogId?: string;
  trigger?: number;
  lgFileId?: string;
  luFileId?: string;
  parentLink?: TreeLink;
  onErrorClick?: (projectId: string, skillId: string, diagnostic: Diagnostic) => void;
  botError?: any;
};

export type TreeMenuItem = {
  icon?: string;
  label: string; // leave this blank to place a separator
  onClick?: (link: TreeLink) => void;
};

export type ProjectTreeOptions = {
  showDelete?: boolean;
  showDialogs?: boolean;
  showLgImports?: boolean;
  showLuImports?: boolean;
  showMenu?: boolean;
  showQnAMenu?: boolean;
  showErrors?: boolean;
  showCommonLinks?: boolean;
  showRemote?: boolean;
  showTriggers?: boolean;
};
