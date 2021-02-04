// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import test from '@bfc/indexers';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';

import { dialogsDispatcher } from '../dialogs';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  luFilesState,
  schemasState,
  dialogSchemasState,
  actionsSeedState,
  onCreateDialogCompleteState,
  showCreateDialogModalState,
  qnaFilesState,
} from '../../atoms';
import { dialogsSelectorFamily, lgFilesSelectorFamily } from '../../selectors';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';

const projectId = '42345.23432';

jest.mock('@bfc/indexers', () => {
  return {
    dialogIndexer: {
      parse: (id: string, content) => ({
        id,
        content,
      }),
    },
    validateDialog: () => [],
    autofixReferInDialog: (_, content) => content,
    lgIndexer: {
      parse: (content, id: string) => ({
        id,
        content,
      }),
    },
    luIndexer: {
      parse: (content, id: string) => ({
        id,
        content,
      }),
    },
    qnaIndexer: {
      parse: (id: string, content) => ({
        id,
        content,
      }),
    },
    lgUtil: {
      parse: (id: string, content) => ({
        id,
        content,
      }),
    },
    luUtil: {
      parse: (id: string, content) => ({
        id,
        content,
      }),
    },
    qnaUtil: {
      parse: (id: string, content) => ({
        id,
        content,
      }),
    },
  };
});

jest.mock('../../parsers/luWorker', () => {
  return {
    parse: (id: string, content) => ({ id, content }),
  };
});

jest.mock('../../parsers/lgWorker', () => {
  return {
    parse: (id: string, content) => ({ id, content }),
  };
});

jest.mock('../../parsers/qnaWorker', () => {
  return {
    parse: (id: string, content) => ({ id, content }),
  };
});

describe('dialog dispatcher', () => {
  const useRecoilTestHook = () => {
    const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
    const dialogSchemas = useRecoilValue(dialogSchemasState(projectId));
    const luFiles = useRecoilValue(luFilesState(projectId));
    const lgFiles = useRecoilValue(lgFilesSelectorFamily(projectId));
    const actionsSeed = useRecoilValue(actionsSeedState(projectId));
    const onCreateDialogComplete = useRecoilValue(onCreateDialogCompleteState(projectId));
    const showCreateDialogModal = useRecoilValue(showCreateDialogModalState);
    const qnaFiles = useRecoilValue(qnaFilesState(projectId));
    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      dialogs,
      dialogSchemas,
      luFiles,
      lgFiles,
      currentDispatcher,
      actionsSeed,
      onCreateDialogComplete,
      showCreateDialogModal,
      qnaFiles,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: dialogsSelectorFamily(projectId), initialValue: [{ id: '1' }, { id: '2' }] },
        { recoilState: dialogSchemasState(projectId), initialValue: [{ id: '1' }, { id: '2' }] },
        { recoilState: lgFilesSelectorFamily(projectId), initialValue: [{ id: '1.en-us' }, { id: '2.en-us' }] },
        { recoilState: luFilesState(projectId), initialValue: [{ id: '1.en-us' }, { id: '2.en-us' }] },
        { recoilState: qnaFilesState(projectId), initialValue: [{ id: '1.en-us' }, { id: '2.en-us' }] },
        { recoilState: schemasState(projectId), initialValue: { sdk: { content: '' } } },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          dialogsDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('removes a dialog file', async () => {
    await act(async () => {
      await dispatcher.createDialog({ id: '3', content: 'abcde', projectId });
    });
    await act(async () => {
      await dispatcher.removeDialog('3', projectId);
    });

    expect(renderedComponent.current.dialogs).toEqual([{ id: '1' }, { id: '2' }]);
    expect(renderedComponent.current.dialogSchemas).toEqual([{ id: '1' }, { id: '2' }]);
    expect(renderedComponent.current.lgFiles).toEqual([{ id: '1.en-us' }, { id: '2.en-us' }]);
    expect(renderedComponent.current.luFiles).toEqual([{ id: '1.en-us' }, { id: '2.en-us' }]);
    expect(renderedComponent.current.qnaFiles).toEqual([{ id: '1.en-us' }, { id: '2.en-us' }]);
  });

  it('updates a dialog file', async () => {
    test.validateDialog = jest.fn().mockReturnValue([]);
    await act(async () => {
      dispatcher.updateDialog({ id: '1', content: 'new', projectId });
    });
    expect(renderedComponent.current.dialogs.find((dialog) => dialog.id === '1')?.content).toEqual('new');
  });

  it('creates a dialog file', async () => {
    await act(async () => {
      await dispatcher.createDialog({ id: '100', content: 'abcde', projectId });
    });
    expect(renderedComponent.current.luFiles.find((dialog) => dialog.id === '100.en-us')).not.toBeNull();
    expect(renderedComponent.current.lgFiles.find((dialog) => dialog.id === '100.en-us')).not.toBeNull();
    expect(renderedComponent.current.qnaFiles.find((dialog) => dialog.id === '100.en-us')).not.toBeNull();
    expect(renderedComponent.current.dialogs.find((dialog) => dialog.id === '100')?.content).toEqual('abcde');
  });

  it('begins creating a dialog', async () => {
    const ACTIONS = [{ action: 'stuff' }];
    const ON_COMPLETE = { action: 'moreStuff' };

    await act(async () => {
      dispatcher.createDialogBegin({ actions: ACTIONS }, ON_COMPLETE, projectId);
    });

    expect(renderedComponent.current.actionsSeed).toEqual({ actions: ACTIONS });
    expect(renderedComponent.current.onCreateDialogComplete).toEqual({ func: ON_COMPLETE });
    expect(renderedComponent.current.showCreateDialogModal).toBe(true);
  });

  it('cancels creating a dialog', async () => {
    await act(async () => {
      await dispatcher.createDialogCancel(projectId);
    });
    expect(renderedComponent.current.actionsSeed).toEqual([]);
    expect(renderedComponent.current.onCreateDialogComplete).toEqual({ func: undefined });
    expect(renderedComponent.current.showCreateDialogModal).toBe(false);
  });
});
