// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent, within, userEvent } from '@botframework-composer/test-utils';

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
            type: {
              type: 'string',
              title: 'Type',
              description: 'Fully qualified type for the adapter',
              default: 'Adapter.Full.Type.Mock',
            },
          },
          required: ['exampleName'],
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
          hidden: ['type'],
        },
      },
    },
  },
};

const setSettingsMock = jest.fn();

const mockNavigationTo = jest.fn();
jest.mock('../../../src/utils/navigation', () => ({
  navigateTo: (...args) => mockNavigationTo(...args),
}));

const makeInitialState =
  (newSettings: any) =>
  ({ set }) => {
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
      initRecoilState,
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
    const { getByTestId, getByLabelText, queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
      initRecoilState,
    );
    const container = getByTestId('adapterSettings');
    const configureButton = within(container).queryAllByText('Configure')[0];
    act(() => {
      fireEvent.click(configureButton);
    });

    await act(async () => {
      fireEvent.change(getByLabelText('Example Name'), { target: { value: 'test text 12345' } });
    });

    await act(async () => {
      const modal = getByTestId('adapterModal');
      userEvent.click(within(modal).getByText('Configure'));
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
            type: 'Adapter.Full.Type.Mock',
          },
        ],
      },
      'Adapter.Mock': {
        exampleName: 'test text 12345',
        route: 'mockRoute',
        $kind: 'Adapter.Mock',
        type: 'Adapter.Full.Type.Mock',
      },
    });
  });

  it('does not proceed if required settings are missing', () => {
    const { getByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
      initRecoilState,
    );
    const container = getByTestId('adapterSettings');
    const configureButton = within(container).queryAllByText('Configure')[0];
    act(() => {
      fireEvent.click(configureButton);
    });

    const modal = getByTestId('adapterModal');
    expect(within(modal).getByRole('button', { name: 'Configure' })).toBeDisabled();
  });

  it('disables an adapter', () => {
    const initStateWithAdapter = {
      runtimeSettings: {
        adapters: [{ name: 'Adapter.Mock', enabled: true, route: 'mock', type: 'Adapter.Full.Type.Mock' }],
      },
      'Adapter.Mock': {
        exampleName: 'example',
        route: 'mock',
        $kind: 'Adapter.Mock',
        type: 'Adapter.Full.Type.Mock',
      },
    };

    const { queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
      makeInitialState(initStateWithAdapter),
    );

    const toggle = queryByTestId('toggle_Adapter.Mock');
    expect(toggle).not.toBeNull();

    act(() => {
      fireEvent.click(toggle!);
    });

    expect(setSettingsMock).toHaveBeenLastCalledWith(
      PROJECT_ID,
      expect.objectContaining({
        runtimeSettings: {
          adapters: [{ name: 'Adapter.Mock', enabled: false, route: 'mock', type: 'Adapter.Full.Type.Mock' }],
        },
      }),
    );
  });

  it('enables an adapter', () => {
    const initStateWithAdapter = {
      runtimeSettings: {
        adapters: [{ name: 'Adapter.Mock', enabled: false, route: 'mock', type: 'Adapter.Full.Type.Mock' }],
      },
      'Adapter.Mock': {
        exampleName: 'example',
        route: 'mock',
        type: 'Adapter.Full.Type.Mock',
      },
    };

    const { queryByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
      makeInitialState(initStateWithAdapter),
    );

    const toggle = queryByTestId('toggle_Adapter.Mock');
    expect(toggle).not.toBeNull();

    act(() => {
      fireEvent.click(toggle!);
    });

    expect(setSettingsMock).toHaveBeenLastCalledWith(
      PROJECT_ID,
      expect.objectContaining({
        runtimeSettings: {
          adapters: [{ name: 'Adapter.Mock', enabled: true, route: 'mock', type: 'Adapter.Full.Type.Mock' }],
        },
      }),
    );
  });

  it('deep link should nav to package manager', async () => {
    const { getByTestId } = renderWithRecoilAndCustomDispatchers(
      <ExternalAdapterSettings projectId={PROJECT_ID} />,
      makeInitialState({}),
    );

    fireEvent.click(getByTestId('packageManagerDeepLink'));

    expect(mockNavigationTo).toHaveBeenCalledWith(`/bot/${PROJECT_ID}/plugin/package-manager/package-manager`);
  });
});
