// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { act, fireEvent } from '@botframework-composer/test-utils';
import * as React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botProjectIdsState, projectMetaDataState } from '../../../recoilModel';
import { getValueFromBotTraceMemory, WatchTabContent } from '../DebugPanel/TabExtensions/WatchTab/WatchTabContent';

describe('<WatchTabContent />', () => {
  describe('rendering', () => {
    it('should add a row to the table', async () => {
      const { findByPlaceholderText, findByText } = renderWithRecoil(<WatchTabContent isActive />, () => {});
      const addButton = await findByText('Add property');

      act(() => {
        fireEvent.click(addButton);
      });

      await findByPlaceholderText('Add property path to watch');
    });

    it('should remove a row from the table', async () => {
      const rootBotId = '123-adc';
      const { findByPlaceholderText, findByText, queryByPlaceholderText } = renderWithRecoil(
        <WatchTabContent isActive />,
        ({ set }) => {
          set(botProjectIdsState, [rootBotId]);
          set(projectMetaDataState(rootBotId), {
            isRootBot: true,
            isRemote: false,
          });
        }
      );
      const addButton = await findByText('Add property');
      const removeButton = await findByText('Remove from list');

      // add a new row
      act(() => {
        fireEvent.click(addButton);
      });

      // select the row
      await act(async () => {
        const newRow = await findByPlaceholderText('Add property path to watch');
        newRow.parentElement && fireEvent.click(newRow.parentElement);
      });

      // remove the row
      await act(async () => {
        fireEvent.click(removeButton);
      });

      const nonexistentRow = queryByPlaceholderText('Add property path to watch');
      expect(nonexistentRow).toBeNull();
    });
  });

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

    it('should get the root of a memory scope', () => {
      const result = getValueFromBotTraceMemory('user', botTrace);

      expect(result.propertyIsAvailable).toBe(true);
      expect(result.value).toEqual(botTrace.value.user);
    });
  });
});
