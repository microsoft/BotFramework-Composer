// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent, within } from '@botframework-composer/test-utils';
import userEvent from '@testing-library/user-event';

import AdapterSettings from '../../../src/pages/botProject/adapters/AdapterSettings';
import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';
import { settingsState, currentProjectIdState, schemasState } from '../../../src/recoilModel';

const state = {
  projectId: 'test',
  settings: {},
};

const mockSchemas = {
  default: {
    definitions: {
      'Adapter.Mock': {
        $schema: 'https://schemas.botframework.com/schemas/component/v1.0/component.schema',
        $role: 'implements(Microsoft.IAdapter)',
        title: 'Mock Adapter',
        properties: {
          exampleName: {
            type: 'string',
            title: 'Example Name',
            description: 'fake skill used for testing',
          },
        },
      },
    },
  },
  ui: {
    content: {
      'Adapter.Mock': {
        form: {
          label: 'Connect to Fake Chat Client',
          subtitle: 'Connect to Fake Chat Client',
          helpLink: 'https://example.com/',
          order: ['exampleName'],
        },
      },
    },
  },
};

const setSettingsMock = jest.fn();

describe('AdapterSettings', () => {
  let initRecoilState;

  beforeEach(() => {
    initRecoilState = ({ set }) => {
      set(currentProjectIdState, state.projectId);
      set(settingsState(state.projectId), state.settings);
      set(dispatcherState, {
        setSettings: setSettingsMock,
      });
      set(schemasState(state.projectId), mockSchemas);
    };
  });

  it('brings up the modal', () => {
    const { getByTestId, getByText, queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <AdapterSettings projectId={state.projectId} />,
      initRecoilState
    );
    const container = getByTestId('adapterSettings');
    let modal = queryByTestId('adapterModal');

    expect(modal).not.toBeInTheDocument();

    expect(getByText('External service adapters')).toBeInTheDocument();
    const configureButton = within(container).queryAllByText('Configure')[0];
    act(() => {
      fireEvent.click(configureButton);
    });

    modal = queryByTestId('adapterModal');
    expect(modal).toBeInTheDocument();
  });

  it('sets settings on an adapter', async () => {
    const { getByTestId, getByLabelText, getByText, queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <AdapterSettings projectId={state.projectId} />,
      initRecoilState
    );
    const container = getByTestId('adapterSettings');
    const configureButton = within(container).queryAllByText('Configure')[0];
    act(() => {
      fireEvent.click(configureButton);
    });

    await act(async () => {
      await userEvent.type(getByLabelText('Example Name'), 'test text 12345', { delay: 50 });
      userEvent.click(getByText('Create'));
    });

    const modal = queryByTestId('adapterModal');
    expect(modal).not.toBeInTheDocument();
    expect(setSettingsMock).toHaveBeenCalledWith(state.projectId, {
      adapters: ['Adapter.Mock'],
      'Adapter.Mock': { exampleName: 'test text 12345' },
    });
  });
});
