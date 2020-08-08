// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import test from '@bfc/indexers';
import { act } from '@bfc/test-utils/lib/hooks';

import { dialogsDispatcher } from '../dialogs';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  dialogsState,
  lgFilesState,
  luFilesState,
  schemasState,
  actionsSeedState,
  onCreateDialogCompleteState,
  showCreateDialogModalState,
  dialogSchemasState,
} from '../../atoms';
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
    autofixReferInDialog: (_, content) => content,
    lgIndexer: {
      parse: (content, id) => ({
        id,
        content,
      }),
    },
    luIndexer: {
      parse: (content, id) => ({
        id,
        content,
      }),
    },
  };
});

jest.mock('../../parsers/luWorker', () => {
  return {
    parse: (id, content) => ({ id, content }),
    addIntent: require('@bfc/indexers/lib/utils/luUtil').addIntent,
    addIntents: require('@bfc/indexers/lib/utils/luUtil').addIntents,
    updateIntent: require('@bfc/indexers/lib/utils/luUtil').updateIntent,
    removeIntent: require('@bfc/indexers/lib/utils/luUtil').removeIntent,
    removeIntents: require('@bfc/indexers/lib/utils/luUtil').removeIntents,
  };
});

jest.mock('../../parsers/lgWorker', () => {
  return {
    parse: (id, content) => ({ id, content }),
    addTemplate: require('../../../utils/lgUtil').addTemplate,
    addTemplates: require('../../../utils/lgUtil').addTemplates,
    updateTemplate: require('../../../utils/lgUtil').updateTemplate,
    removeTemplate: require('../../../utils/lgUtil').removeTemplate,
    removeAllTemplates: require('../../../utils/lgUtil').removeTemplates,
    copyTemplate: require('../../../utils/lgUtil').copyTemplate,
  };
});

describe('dialog dispatcher', () => {
  let renderedComponent, dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const dialogs = useRecoilValue(dialogsState);
      const dialogSchemas = useRecoilValue(dialogSchemasState);
      const luFiles = useRecoilValue(luFilesState);
      const lgFiles = useRecoilValue(lgFilesState);
      const currentDispatcher = useRecoilValue(dispatcherState);
      const actionsSeed = useRecoilValue(actionsSeedState);
      const onCreateDialogComplete = useRecoilValue(onCreateDialogCompleteState);
      const showCreateDialogModal = useRecoilValue(showCreateDialogModalState);

      return {
        dialogs,
        dialogSchemas,
        luFiles,
        lgFiles,
        currentDispatcher,
        actionsSeed,
        onCreateDialogComplete,
        showCreateDialogModal,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: dialogsState, initialValue: [{ id: '1' }, { id: '2' }] },
        { recoilState: dialogSchemasState, initialValue: [{ id: '1' }, { id: '2' }] },
        { recoilState: lgFilesState, initialValue: [{ id: '1.lg' }, { id: '2' }] },
        { recoilState: luFilesState, initialValue: [{ id: '1.lu' }, { id: '2' }] },
        { recoilState: schemasState, initialValue: { sdk: { content: '' } } },
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
      await dispatcher.removeDialog('1');
    });
    expect(renderedComponent.current.dialogs).toEqual([{ id: '2' }]);
    expect(renderedComponent.current.dialogSchemas).toEqual([{ id: '2' }]);
    expect(renderedComponent.current.lgFiles).toEqual([{ id: '2' }]);
    expect(renderedComponent.current.luFiles).toEqual([{ id: '2' }]);
  });

  it('updates a dialog file', async () => {
    test.validateDialog = jest.fn().mockReturnValue([]);
    await act(async () => {
      await dispatcher.updateDialog({ id: '1', content: 'new' });
    });
    expect(renderedComponent.current.dialogs.find((dialog) => dialog.id === '1').content).toEqual('new');
  });

  it('creates a dialog file', async () => {
    await act(async () => {
      await dispatcher.createDialog({ id: '100', content: 'abcde' });
    });
    expect(renderedComponent.current.luFiles.find((dialog) => dialog.id === '100.en-us')).not.toBeNull();
    expect(renderedComponent.current.lgFiles.find((dialog) => dialog.id === '100.en-us')).not.toBeNull();
    expect(renderedComponent.current.dialogs.find((dialog) => dialog.id === '100').content).toEqual('abcde');
  });

  it('begins creating a dialog', async () => {
    const ACTIONS = [{ action: 'stuff' }];
    const ON_COMPLETE = { action: 'moreStuff' };

    await act(async () => {
      await dispatcher.createDialogBegin({ actions: ACTIONS }, ON_COMPLETE);
    });
    expect(renderedComponent.current.actionsSeed).toEqual({ actions: ACTIONS });
    expect(renderedComponent.current.onCreateDialogComplete).toEqual({ func: ON_COMPLETE });
    expect(renderedComponent.current.showCreateDialogModal).toBe(true);
  });

  it('cancels creating a dialog', async () => {
    await act(async () => {
      await dispatcher.createDialogCancel();
    });
    expect(renderedComponent.current.actionsSeed).toEqual([]);
    expect(renderedComponent.current.onCreateDialogComplete).toEqual({ func: undefined });
    expect(renderedComponent.current.showCreateDialogModal).toBe(false);
  });
});
