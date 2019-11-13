// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copyAdaptiveAction } from '../../src/copyUtils';
import { CopyConstructorMap } from '../../src/copyUtils/copyAdaptiveAction';
import { SDKTypes } from '../../src';

import { externalApiStub as externalApi } from './externalApiStub';

describe('copyAdaptiveAction', () => {
  it('should return {} when input is invalid', async () => {
    expect(await copyAdaptiveAction('hello', externalApi)).toEqual('hello');

    expect(await copyAdaptiveAction(null as any, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({} as any, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({ name: 'hi' } as any, externalApi)).toEqual({});
  });

  describe('should call certain handler in CopyConstructorMap', () => {
    let originCopyConstructorMap = {};
    beforeAll(() => {
      originCopyConstructorMap = { ...CopyConstructorMap };
    });

    beforeEach(() => {
      Object.keys(CopyConstructorMap).forEach(key => {
        CopyConstructorMap[key] = jest.fn();
      });
    });

    afterAll(() => {
      Object.keys(CopyConstructorMap).forEach(key => {
        CopyConstructorMap[key] = originCopyConstructorMap[key];
      });
    });

    it('when handler registered', async () => {
      const registeredUniqueTypes = [
        SDKTypes.SendActivity,
        SDKTypes.IfCondition,
        SDKTypes.SwitchCondition,
        SDKTypes.EditActions,
        SDKTypes.ChoiceInput,
        SDKTypes.Foreach,
      ];

      for (const $type of registeredUniqueTypes) {
        await copyAdaptiveAction({ $type }, externalApi);
        expect(CopyConstructorMap[$type]).toHaveBeenCalledTimes(1);
      }

      for (const $type of registeredUniqueTypes) {
        await copyAdaptiveAction({ $type }, externalApi);
        expect(CopyConstructorMap[$type]).toHaveBeenCalledTimes(2);
      }
    });

    it('when handler not registered', async () => {
      await copyAdaptiveAction({ $type: SDKTypes.BeginDialog }, externalApi);
      expect(CopyConstructorMap.default).toHaveReturnedTimes(1);

      await copyAdaptiveAction({ $type: SDKTypes.HttpRequest }, externalApi);
      expect(CopyConstructorMap.default).toHaveReturnedTimes(2);
    });
  });
});
