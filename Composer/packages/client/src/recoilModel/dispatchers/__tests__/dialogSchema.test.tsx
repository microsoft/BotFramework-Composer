// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@botframework-composer/test-utils/lib/hooks';

import { dialogSchemaDispatcher } from '../dialogSchema';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { dialogSchemasState, currentProjectIdState, dispatcherState } from '../../atoms';
import { Dispatcher } from '..';

const projectId = '42345.23432';

describe('dialog schema dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const dialogSchemas = useRecoilValue(dialogSchemasState(projectId));
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        currentDispatcher,
        dialogSchemas,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: dialogSchemasState(projectId), initialValue: [{ id: '1' }, { id: '2' }] },
        { recoilState: currentProjectIdState, initialValue: projectId },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          dialogSchemaDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('updates a dialog schema file', async () => {
    await act(async () => {
      await dispatcher.updateDialogSchema({ id: '1', content: 'new' }, projectId);
    });
    expect(renderedComponent.current.dialogSchemas.find((dialog) => dialog.id === '1').content).toEqual('new');
  });

  it('creates a dialog schema file', async () => {
    await act(async () => {
      await dispatcher.updateDialogSchema({ id: '100', content: 'abcde' }, projectId);
    });
    expect(renderedComponent.current.dialogSchemas.find((dialogSchema) => dialogSchema.id === '100').content).toEqual(
      'abcde'
    );
  });
});
