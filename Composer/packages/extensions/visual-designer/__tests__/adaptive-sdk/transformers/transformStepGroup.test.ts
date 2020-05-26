// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { transformStepGroup } from '../../../src/adaptive-sdk/transformers/transformStepGroup';
import { ObiTypes } from '../../../src/constants/ObiTypes';

test('should return safely when input null value', () => {
  const result = transformStepGroup(null, '');
  expect(result).toEqual([]);
});

test('should transform string as BeginDialog', () => {
  const result = transformStepGroup(
    {
      $kind: ObiTypes.StepGroup,
      children: ['CalleeDialog'],
    },
    ''
  );
  expect(result[0].json).toEqual({
    $kind: ObiTypes.BeginDialog,
    dialog: 'CalleeDialog',
  });
});

test('should parse child step correctly with parentPath', () => {
  const json = {
    $kind: ObiTypes.StepGroup,
    children: [{ $kind: 'any' }, { $kind: 'any' }],
  };
  const result = transformStepGroup(json, 'steps');
  expect(result).toBeTruthy();
  expect(result.length).toEqual(json.children.length);

  for (let i = 0; i < json.children.length; i++) {
    expect(result[i].id).toEqual(`steps[${i}]`);
  }
});
