// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TriggerUISchema } from '@bfc/extension-client';
import { SDKKinds } from '@botframework-composer/types';

import {
  generateTriggerOptionTree,
  TriggerOptionGroupNode,
} from '../../../src/components/TriggerCreationModal/TriggerOptionTree';

describe('generateTriggerOptionTree()', () => {
  it('can generate one layer tree.', () => {
    const simpleTriggerUIOptions: TriggerUISchema = {
      [SDKKinds.OnIntent]: {
        label: '1.OnIntent',
        order: 1,
      },
      [SDKKinds.OnInvokeActivity]: {
        label: '2.OnInvokeActivity',
        order: 2,
      },
    };
    const tree = generateTriggerOptionTree(simpleTriggerUIOptions, 'Select a trigger', 'Which trigger?');

    expect(tree.prompt).toEqual('Select a trigger');
    expect(tree.placeholder).toEqual('Which trigger?');

    expect(tree.parent).toBeNull();
    expect(tree.children.length).toEqual(2);

    expect(tree.children[0].label).toEqual('1.OnIntent');
    expect(tree.children[0].parent).toEqual(tree);

    expect(tree.children[1].label).toEqual('2.OnInvokeActivity');
    expect(tree.children[1].parent).toEqual(tree);
  });

  it('can generate tree with submenu.', () => {
    const advancedTriggerUIOptions: TriggerUISchema = {
      [SDKKinds.OnIntent]: {
        label: '1.OnIntent',
        order: 1,
      },
      [SDKKinds.OnTypingActivity]: {
        label: '2.1.OnTypingActivity',
        order: 2.1,
        submenu: {
          label: '2.Activities',
          prompt: 'Select an activity trigger',
          placeholder: 'Which activity?',
        },
      },
      [SDKKinds.OnEventActivity]: {
        label: '2.2OnEventActivity',
        order: 2.2,
        submenu: '2.Activities',
      },
      [SDKKinds.OnInvokeActivity]: {
        label: '2.3OnInvokeActivity',
        order: 2.3,
        submenu: '2.Activities',
      },
    };
    const tree = generateTriggerOptionTree(advancedTriggerUIOptions, 'Select a trigger', 'Which trigger?');

    expect(tree.children.length).toEqual(2);

    expect(tree.children[0].label).toEqual('1.OnIntent');
    expect(tree.children[0].parent).toEqual(tree);

    const secondChild = tree.children[1] as TriggerOptionGroupNode;
    expect(secondChild.label).toEqual('2.Activities');
    expect(secondChild.prompt).toEqual('Select an activity trigger');
    expect(secondChild.children.length).toEqual(3);

    expect(secondChild.children[0].label).toEqual('2.1.OnTypingActivity');
    expect(secondChild.children[0].parent).toEqual(secondChild);
  });
});
