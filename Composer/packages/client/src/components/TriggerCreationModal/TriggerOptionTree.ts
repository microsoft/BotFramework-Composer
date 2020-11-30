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

  const allOptionEntries = Object.entries(triggerUIOptions).filter(([, option]) => Boolean(option)) as [
    string,
    TriggerUIOption
  ][];
  const leafEntries = allOptionEntries.filter(([, options]) => !options.submenu);
  const nonLeafEntries = allOptionEntries.filter(([, options]) => options.submenu);

  // Build leaf nodes whose depth = 1.
  const leafNodeList = leafEntries.map(
    ([$kind, options]) => new TriggerOptionLeafNode(options?.label ?? '', $kind, options?.order)
  );

  // Insert depth 1 leaf nodes to tree.
  root.children.push(...leafNodeList);
  leafNodeList.forEach((leaf) => (leaf.parent = root));

  // Build group nodes.
  const groups = nonLeafEntries
    .map(([, options]) => options.submenu)
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

  // Insert depth 1 group nodes to tree.
  root.children.push(...Object.values(groups));

  // Build other leaf nodes whose depth = 2 and mount to related group node
  nonLeafEntries.forEach(([$kind, options]) => {
    const { label, submenu, order } = options;
    const node = new TriggerOptionLeafNode(label, $kind, order);

    const groupName = getGroupKey(submenu);
    const groupParent = groups[groupName];

    groupParent.children.push(node);
    node.parent = groupParent;
    // Apply minimum child node order to group node for sorting.
    groupParent.order = Math.min(groupParent.order, order ?? Number.MAX_SAFE_INTEGER);
  });

  // Sort by node's 'order'.
  root.children.sort((a, b) => a.order - b.order);
  Object.values(groups).forEach((x) => x.children.sort((a, b) => a.order - b.order));

  return root;
};
