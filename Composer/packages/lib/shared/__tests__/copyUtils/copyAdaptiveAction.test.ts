// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { externalApiStub as externalApi } from '../jestMocks/externalApiStub';
import { SDKTypes } from '../../src';
import CopyConstructorMap from '../../src/copyUtils/CopyConstructorMap';
import { copyAdaptiveAction } from '../../src/copyUtils';

// NOTES: Cannot use SDKTypes here. `jest.mock` has to have zero dependency.
jest.mock('../../src/copyUtils/CopyConstructorMap', () => ({
  'Microsoft.SendActivity': jest.fn(),
  'Microsoft.IfCondition': jest.fn(),
  'Microsoft.SwitchCondition': jest.fn(),
  'Microsoft.EditActions': jest.fn(),
  'Microsoft.ChoiceInput': jest.fn(),
  'Microsoft.Foreach': jest.fn(),
  default: jest.fn(),
}));

describe('copyAdaptiveAction', () => {
  it('should return {} when input is invalid', async () => {
    expect(await copyAdaptiveAction('hello', externalApi)).toEqual('hello');

    expect(await copyAdaptiveAction(null as any, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({} as any, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({ name: 'hi' } as any, externalApi)).toEqual({});
  });

  const registeredTypes = [
    SDKTypes.SendActivity,
    SDKTypes.IfCondition,
    SDKTypes.SwitchCondition,
    SDKTypes.EditActions,
    SDKTypes.ChoiceInput,
    SDKTypes.Foreach,
  ];
  for (const $type of registeredTypes) {
    it(`should invoke registered handler for ${$type}`, async () => {
      await copyAdaptiveAction({ $type }, externalApi);
      expect(CopyConstructorMap[$type]).toHaveReturnedTimes(1);
    });
  }

  it('should invoke default handler for other types', async () => {
    await copyAdaptiveAction({ $type: SDKTypes.BeginDialog }, externalApi);
    expect(CopyConstructorMap.default).toHaveReturnedTimes(1);

    await copyAdaptiveAction({ $type: SDKTypes.HttpRequest }, externalApi);
    expect(CopyConstructorMap.default).toHaveReturnedTimes(2);
  });
});
