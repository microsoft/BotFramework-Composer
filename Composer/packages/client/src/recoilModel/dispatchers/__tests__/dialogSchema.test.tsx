// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';

import { dialogSchemaDispatcher } from '../dialogSchema';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { dialogSchemasState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';

describe('dialog schema dispatcher', () => {
  let renderedComponent, dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const dialogSchemas = useRecoilValue(dialogSchemasState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        currentDispatcher,
        dialogSchemas,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [{ recoilState: dialogSchemasState, initialValue: [{ id: '1' }, { id: '2' }] }],
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
      await dispatcher.updateDialogSchema({ id: '1', content: 'new' });
    });
    expect(renderedComponent.current.dialogSchemas.find((dialog) => dialog.id === '1').content).toEqual('new');
  });

  it('creates a dialog schema file', async () => {
    await act(async () => {
      await dispatcher.updateDialogSchema({ id: '100', content: 'abcde' });
    });
    expect(renderedComponent.current.dialogSchemas.find((dialogSchema) => dialogSchema.id === '100').content).toEqual(
      'abcde'
    );
  });
});
