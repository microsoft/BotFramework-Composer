// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getValueFromBotTraceMemory } from '../DebugPanel/TabExtensions/WatchTab/WatchTabContent';

describe('<WatchTabContent />', () => {
  describe('getValueFromBotTraceMemory', () => {
    const botTrace: any = {
      // memory scopes
      value: {
        user: {
          outer: {
            inner: {
              someNum: 123,
              someString: 'blah',
            },
          },
        },
      },
    };
    it("should get an existing property from the bot trace's memory scope", () => {
      const result = getValueFromBotTraceMemory('user.outer.inner.someNum', botTrace);

      expect(result.propertyIsAvailable).toBe(true);
      expect(result.value).toBe(123);
    });

    it('should be able to tell if the property does not exist', () => {
      const result = getValueFromBotTraceMemory('user.outer.nonExistent.someProp', botTrace);

      expect(result.propertyIsAvailable).toBe(false);
      expect(result.value).toBe(undefined);
    });

    it('should get an undefined property on an existing key', () => {
      const result = getValueFromBotTraceMemory('user.outer.inner.someProp', botTrace);

      expect(result.propertyIsAvailable).toBe(true);
      expect(result.value).toBe(undefined);
    });
  });
});
