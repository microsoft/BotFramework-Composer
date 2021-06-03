// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TreeLink } from './types';

export const doesLinkMatch = (linkInTree?: Partial<TreeLink>, selectedLink?: Partial<TreeLink>) => {
  if (linkInTree == null || selectedLink == null) return false;
  return (
    linkInTree.skillId === selectedLink.skillId &&
    linkInTree.dialogId === selectedLink.dialogId &&
    linkInTree.trigger === selectedLink.trigger &&
    linkInTree.lgFileId === selectedLink.lgFileId &&
    linkInTree.luFileId === selectedLink.luFileId
  );
};

export const isChildTriggerLinkSelected = (linkInTree?: Partial<TreeLink>, selectedLink?: Partial<TreeLink>) => {
  if (linkInTree == null || selectedLink == null) return false;
  return linkInTree.skillId === selectedLink.skillId && linkInTree.dialogId === selectedLink.dialogId;
};

export const isChildDialogLinkSelected = (linkInTree?: Partial<TreeLink>, selectedLink?: Partial<TreeLink>) => {
  if (linkInTree == null || selectedLink == null) return false;
  return linkInTree.skillId === selectedLink.skillId;
};
