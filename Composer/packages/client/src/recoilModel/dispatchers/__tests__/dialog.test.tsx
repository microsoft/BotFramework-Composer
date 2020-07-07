// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import test from '@bfc/indexers';

import { dialogsDispatcher } from '../dialogs';
import { renderRecoilHook, act } from '../../../../__tests__/testUtils';
import { dialogsState, lgFilesState, luFilesState, schemasState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
jest.mock('@bfc/indexers', () => {
  return {
    dialogIndexer: {
      parse: (id, content) => ({
        id,
        content,
      }),
    },
    validateDialog: () => [],
    autofixReferInDialog: (content) => content,
  };
});

describe('dialog dispatcher', () => {
  let renderedComponent;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const dialogs = useRecoilValue(dialogsState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        dialogs,
        currentDispatcher,
      };
    };

    renderedComponent = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: dialogsState, initialValue: [{ id: '1' }, { id: '2' }] },
        { recoilState: lgFilesState, initialValue: [{ id: '1' }] },
        { recoilState: luFilesState, initialValue: [{ id: '1' }] },
        { recoilState: schemasState, initialValue: { sdk: { content: '' } } },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          dialogsDispatcher,
        },
      },
    });
  });

  it('remove dialog file', async () => {
    await act(async () => {
      await renderedComponent.result.current.currentDispatcher.removeDialog('1');
    });
    expect(renderedComponent.result.current.dialogs).toEqual([{ id: '2' }]);
  });

  it('create dialog file', async () => {
    test.validateDialog = jest.fn().mockReturnValue([]);
    await act(async () => {
      await renderedComponent.result.current.currentDispatcher.updateDialog({ id: '1', content: 'new' });
    });
    expect(renderedComponent.result.current.dialogs.find((dialog) => dialog.id === '1').content).toEqual('new');
  });
});
