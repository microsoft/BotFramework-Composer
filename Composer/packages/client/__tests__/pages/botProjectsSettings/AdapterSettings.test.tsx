// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent, within } from '@botframework-composer/test-utils';
import userEvent from '@testing-library/user-event';

import ExternalAdapterSettings from '../../../src/pages/botProject/adapters/ExternalAdapterSettings';
import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';
import { settingsState, currentProjectIdState, schemasState } from '../../../src/recoilModel';

const PROJECT_ID = 'test';

const defaultSettings = {};

const mockSchemas = {
  sdk: {
    content: {
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
            route: {
              type: 'string',
              title: 'Route',
              description: 'Route',
              default: 'mockRoute',
            },
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
          order: ['route', 'exampleName'],
        },
      },
    },
  },
};

const setSettingsMock = jest.fn();

const makeInitialState = (newSettings: {}) => ({ set }) => {
  set(currentProjectIdState, PROJECT_ID);
  set(settingsState(PROJECT_ID), newSettings);
  set(dispatcherState, {
    setSettings: setSettingsMock,
  });
  set(schemasState(PROJECT_ID), mockSchemas);
};

describe('ExternalAdapterSettings', () => {
  let initRecoilState;

  beforeEach(() => {
    initRecoilState = makeInitialState(defaultSettings);
    setSettingsMock.mockClear();
  });

  it('brings up the modal', () => {
    const { getByTestId, getByText, queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
      initRecoilState
    );

    const container = getByTestId('adapterSettings');
    let modal = queryByTestId('adapterModal');

    expect(modal).not.toBeInTheDocument();

    expect(getByText('Mock Adapter')).toBeInTheDocument();
    const configureButton = within(container).queryAllByText('Configure')[0];
    act(() => {
      fireEvent.click(configureButton);
    });

    modal = queryByTestId('adapterModal');
    expect(modal).toBeInTheDocument();
  });

  it('sets settings on an adapter', async () => {
    const { getByTestId, getByLabelText, getByText, queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
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
    expect(setSettingsMock).toHaveBeenCalledWith(PROJECT_ID, {
      runtimeSettings: {
        adapters: [
          {
            name: 'Adapter.Mock',
            route: 'mockRoute',
            enabled: true,
          },
        ],
      },
      'Adapter.Mock': { exampleName: 'test text 12345', route: 'mockRoute', $kind: 'Adapter.Mock' },
    });
  });

  it('disables an adapter', async () => {
    const initStateWithAdapter = {
      runtimeSettings: { adapters: [{ name: 'Adapter.Mock', enabled: true, route: 'mock' }] },
      'Adapter.Mock': {
        exampleName: 'example',
        route: 'mock',
        $kind: 'Adapter.Mock',
      },
    };

    const { queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
      makeInitialState(initStateWithAdapter)
    );

    const toggle = queryByTestId('toggle_Adapter.Mock');
    expect(toggle).not.toBeNull();

    await act(async () => {
      fireEvent.click(toggle!);
    });

    expect(setSettingsMock).toHaveBeenLastCalledWith(
      PROJECT_ID,
      expect.objectContaining({
        runtimeSettings: { adapters: [{ name: 'Adapter.Mock', enabled: false, route: 'mock' }] },
      })
    );
  });

  it('enables an adapter', async () => {
    const initStateWithAdapter = {
      runtimeSettings: { adapters: [{ name: 'Adapter.Mock', enabled: false, route: 'mock' }] },
      'Adapter.Mock': {
        exampleName: 'example',
        route: 'mock',
      },
    };

    const { queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
      makeInitialState(initStateWithAdapter)
    );

    const toggle = queryByTestId('toggle_Adapter.Mock');
    expect(toggle).not.toBeNull();

    await act(async () => {
      fireEvent.click(toggle!);
    });

    expect(setSettingsMock).toHaveBeenLastCalledWith(
      PROJECT_ID,
      expect.objectContaining({
        runtimeSettings: { adapters: [{ name: 'Adapter.Mock', enabled: true, route: 'mock' }] },
      })
    );
  });
});
