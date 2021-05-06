// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { discoverNestedPaths, isTrigger } from '../../../src/validations/schemaValidation/schemaUtils';

import { onConversationUpdateActivityStub, simpleGreetingDialog, switchConditionStub } from './__mocks__/dialogMocks';
import {
  AdaptiveDialogSchema,
  IfConditionSchema,
  OnConvUpdateSchema,
  OnDialogEventSchema,
  SetPropertiesSchema,
  SwitchConditionSchema,
} from './__mocks__/sdkSchemaMocks';

describe('#schemaUtils', () => {
  it('isTrigger() should recognizer trigger schema.', () => {
    expect(isTrigger(OnDialogEventSchema)).toBeTruthy();
    expect(isTrigger(IfConditionSchema)).toBeFalsy();
    expect(isTrigger(AdaptiveDialogSchema)).toBeFalsy();
  });

  it('discoverNestedProperties() should find correct property names.', () => {
    expect(discoverNestedPaths(simpleGreetingDialog, AdaptiveDialogSchema)).toEqual(
      expect.arrayContaining(['triggers'])
    );
    expect(discoverNestedPaths(onConversationUpdateActivityStub, OnConvUpdateSchema)).toEqual(
      expect.arrayContaining(['actions'])
    );
    expect(discoverNestedPaths(switchConditionStub, SwitchConditionSchema)).toEqual(
      expect.arrayContaining(['cases[0].actions', 'default'])
    );
  });

  it('disconverNestedProperties() should defense invalid input.', () => {
    const setPropertiesStub = {
      $kind: 'Microsoft.SetProperties',
      $designer: {
        id: 'sJzdQm',
      },
      assignments: [
        { property: 'username', value: 'test' }
      ]
    };

    expect(discoverNestedPaths(setPropertiesStub, SetPropertiesSchema)).toEqual([]);
  })
});
