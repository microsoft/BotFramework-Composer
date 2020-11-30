// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TriggerUISchema, TriggerUIOption } from '@bfc/extension-client';

export class TriggerOptionLeafNode {
  label: string;
  order: number;
  $kind: string;
  parent: TriggerOptionGroupNode | null = null;

  constructor(label: string, $kind: string, order?: number) {
    this.label = label;
    this.$kind = $kind;
    this.order = order ?? Number.MAX_SAFE_INTEGER;
  }
}

export class TriggerOptionGroupNode {
  label: string;
  order: number;
  /** Title of a dropdown. 'Which activity type?' */
  prompt?: string;
  /** Placeholder of a dropdown input. 'Select an activity type' */
  placeholder?: string;
  children: (TriggerOptionLeafNode | TriggerOptionGroupNode)[] = [];
  parent: TriggerOptionGroupNode | null = null;

  constructor(label: string, prompt?: string, placeholder?: string) {
    this.label = label;
    this.prompt = prompt;
    this.placeholder = placeholder;
    this.order = Number.MAX_SAFE_INTEGER;
  }
}

export type TriggerOptionTree = TriggerOptionGroupNode;

export type TriggerOptionTreeNode = TriggerOptionGroupNode | TriggerOptionLeafNode;

const getGroupKey = (submenu) => (typeof submenu === 'object' ? submenu.label : submenu || '');

export const generateTriggerOptionTree = (
  triggerUIOptions: TriggerUISchema,
  rootPrompt: string,
  rootPlaceHolder: string
): TriggerOptionTree => {
  const root = new TriggerOptionGroupNode('triggerTypeDropDown', rootPrompt, rootPlaceHolder);

  const leafNodeList = Object.entries(triggerUIOptions)
    .filter(([, options]) => options && !options.submenu)
    .map(([$kind, options]) => new TriggerOptionLeafNode(options?.label ?? '', $kind, options?.order));
  root.children.push(...leafNodeList);
  leafNodeList.forEach((leaf) => (leaf.parent = root));

  const groups = Object.values(triggerUIOptions)
    .map((options) => options && options.submenu)
    .filter(Boolean)
    .reduce((result, submenu) => {
      const name = getGroupKey(submenu);
      if (!result[name]) result[name] = new TriggerOptionGroupNode(name, '', '');
      if (typeof submenu === 'object') {
        const tree: TriggerOptionGroupNode = result[name];
        tree.prompt = submenu.prompt;
        tree.placeholder = submenu.placeholder;
        tree.parent = root;
      }
      return result;
    }, {} as { [key: string]: TriggerOptionGroupNode });

  Object.entries(triggerUIOptions)
    .filter(([, options]) => options && options.submenu)
    .forEach(([$kind, options]) => {
      const { label, submenu, order } = options as TriggerUIOption;
      const node = new TriggerOptionLeafNode(label, $kind, order);

      const groupName = getGroupKey(submenu);
      const groupParent = groups[groupName];

      groupParent.children.push(node);
      node.parent = groupParent;
      groupParent.order = Math.min(groupParent.order, order ?? Number.MAX_SAFE_INTEGER);
    });
  root.children.push(...Object.values(groups));

  // sort tree nodes
  root.children.sort((a, b) => a.order - b.order);
  Object.values(groups).forEach((x) => x.children.sort((a, b) => a.order - b.order));

  return root;
};
