// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';

import { dialogsDispatcher } from '../dialogs';
import { triggerDispatcher } from '../trigger';
import { lgDispatcher } from '../lg';
import { luDispatcher } from '../lu';
import { navigationDispatcher } from '../navigation';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  lgFilesState,
  luFilesState,
  schemasState,
  dialogSchemasState,
  actionsSeedState,
  qnaFilesState,
} from '../../atoms';
import { dialogsSelectorFamily } from '../../selectors';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';
import { DialogInfo } from '../../../../../types';

const projectId = '42345.23432';

const QnATriggerData1 = {
  $kind: 'Microsoft.OnQnAMatch',
  errors: { $kind: '', intent: '', event: '', triggerPhrases: '', regEx: '', activity: '' },
  event: '',
  intent: '',
  regEx: '',
  triggerPhrases: '',
};

const intentTriggerData1 = {
  $kind: 'Microsoft.OnIntent',
  errors: { $kind: '', intent: '', event: '', triggerPhrases: '', regEx: '', activity: '' },
  event: '',
  intent: '',
  regEx: '',
  triggerPhrases: '',
};

const chooseIntentTriggerData1 = {
  $kind: 'Microsoft.OnChooseIntent',
  errors: { $kind: '', intent: '', event: '', triggerPhrases: '', regEx: '', activity: '' },
  event: '',
  intent: '',
  regEx: '',
  triggerPhrases: '',
};

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

describe('trigger dispatcher', () => {
  const useRecoilTestHook = () => {
    const dialogs: DialogInfo[] = useRecoilValue(dialogsSelectorFamily(projectId));
    const dialogSchemas = useRecoilValue(dialogSchemasState(projectId));
    const luFiles = useRecoilValue(luFilesState(projectId));
    const lgFiles = useRecoilValue(lgFilesState(projectId));
    const actionsSeed = useRecoilValue(actionsSeedState(projectId));
    const qnaFiles = useRecoilValue(qnaFilesState(projectId));
    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      dialogs,
      dialogSchemas,
      luFiles,
      lgFiles,
      currentDispatcher,
      actionsSeed,
      qnaFiles,
    };
  };
  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        {
          recoilState: dialogsSelectorFamily(projectId),
          initialValue: [
            { id: '1', content: {} },
            { id: '2', content: {} },
          ],
        },
        { recoilState: dialogSchemasState(projectId), initialValue: [{ id: '1' }, { id: '2' }] },
        {
          recoilState: lgFilesState(projectId),
          initialValue: [
            { id: '1.en-us', content: '' },
            { id: '2.en-us', content: '' },
          ],
        },
        {
          recoilState: luFilesState(projectId),
          initialValue: [
            { id: '1.en-us', content: '' },
            { id: '2.en-us', content: '' },
          ],
        },
        {
          recoilState: qnaFilesState(projectId),
          initialValue: [
            { id: '1.en-us', content: '' },
            { id: '2.en-us', content: '' },
          ],
        },
        { recoilState: schemasState(projectId), initialValue: { sdk: { content: {} } } },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          dialogsDispatcher,
          triggerDispatcher,
          lgDispatcher,
          luDispatcher,
          navigationDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('create a qna intent trigger', async () => {
    const dialogId = '1';
    await act(async () => {
      await dispatcher.createTrigger(projectId, dialogId, QnATriggerData1);
    });
    const updatedDialog = renderedComponent.current.dialogs.find(({ id }) => id === dialogId);
    expect(updatedDialog?.content?.triggers?.length).toEqual(1);
  });

  it('create a choose intent trigger', async () => {
    const dialogId = '1';
    await act(async () => {
      await dispatcher.createTrigger(projectId, dialogId, chooseIntentTriggerData1);
    });
    const updatedDialog = renderedComponent.current.dialogs.find(({ id }) => id === dialogId);
    expect(updatedDialog?.content?.triggers?.length).toEqual(1);
  });

  it('create a intent trigger', async () => {
    const dialogId = '1';
    await act(async () => {
      await dispatcher.createTrigger(projectId, dialogId, intentTriggerData1);
    });
    const updatedDialog = renderedComponent.current.dialogs.find(({ id }) => id === dialogId);
    expect(updatedDialog?.content?.triggers?.length).toEqual(1);
  });

  it('delete a trigger', async () => {
    const dialogId = '1';
    await act(async () => {
      await dispatcher.createTrigger(projectId, dialogId, QnATriggerData1);
    });
    const updatedDialog = renderedComponent.current.dialogs.find(({ id }) => id === dialogId);
    if (updatedDialog == null) fail();
    expect(updatedDialog.content?.triggers.length).toEqual(1);

    const targetTrigger = (updatedDialog?.content as any).triggers[0];
    await act(async () => {
      // @ts-ignore - targetTrigger should be an ITriggerCondition, but we give it an ITrigger
      await dispatcher.deleteTrigger(projectId, dialogId, targetTrigger);
    });
    const updatedDialog2 = renderedComponent.current.dialogs.find(({ id }) => id === dialogId);
    expect((updatedDialog2?.content.triggers as any[])?.length).toEqual(1);
  });
});
