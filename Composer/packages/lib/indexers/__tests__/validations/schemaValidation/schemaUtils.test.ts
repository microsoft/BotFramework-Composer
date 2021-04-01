// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { discoverNestedProperties, isTrigger } from '../../../src/validations/schemaValidation/schemaUtils';

import {
  AdaptiveDialogSchema,
  IfConditionSchema,
  OnDialogEventSchema,
  SwitchConditionSchema,
} from './__mocks__/sdkSchemaMocks';

describe('#schemaUtils', () => {
  it('isTrigger() should recognizer trigger schema.', () => {
    expect(isTrigger(OnDialogEventSchema)).toBeTruthy();
    expect(isTrigger(IfConditionSchema)).toBeFalsy();
    expect(isTrigger(AdaptiveDialogSchema)).toBeFalsy();
  });

  it('discoverNestedProperties() should find correct property names.', () => {
    expect(discoverNestedProperties(AdaptiveDialogSchema)).toEqual(expect.arrayContaining(['triggers', 'dialogs']));
    expect(discoverNestedProperties(OnDialogEventSchema)).toEqual(expect.arrayContaining(['actions']));
    expect(discoverNestedProperties(IfConditionSchema)).toEqual(expect.arrayContaining(['actions', 'elseActions']));
    expect(discoverNestedProperties(SwitchConditionSchema)).toEqual(expect.arrayContaining(['cases', 'default']));
  });
});
