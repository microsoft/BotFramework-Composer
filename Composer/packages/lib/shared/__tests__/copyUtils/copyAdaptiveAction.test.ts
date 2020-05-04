// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { externalApiStub as externalApi } from '../__mocks__/externalApiStub';
import { SDKKinds } from '../../src';
import CopyConstructorMap from '../../src/copyUtils/CopyConstructorMap';
import { copyAdaptiveAction } from '../../src/copyUtils';

// NOTES: Cannot use SDKKinds here. `jest.mock` has to have zero dependency.
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
    SDKKinds.SendActivity,
    SDKKinds.IfCondition,
    SDKKinds.SwitchCondition,
    SDKKinds.EditActions,
    SDKKinds.ChoiceInput,
    SDKKinds.Foreach,
  ];
  for (const $kind of registeredTypes) {
    it(`should invoke registered handler for ${$kind}`, async () => {
      await copyAdaptiveAction({ $kind }, externalApi);
      expect(CopyConstructorMap[$kind]).toHaveReturnedTimes(1);
    });
  }

  it('should invoke default handler for other types', async () => {
    await copyAdaptiveAction({ $kind: SDKKinds.BeginDialog }, externalApi);
    expect(CopyConstructorMap.default).toHaveReturnedTimes(1);

    await copyAdaptiveAction({ $kind: SDKKinds.HttpRequest }, externalApi);
    expect(CopyConstructorMap.default).toHaveReturnedTimes(2);
  });
});
