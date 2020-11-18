// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@botframework-composer/test-utils/lib/hooks';

import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { ServerSettingsState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';
import { serverSettingsDispatcher } from '../serverSettings';
import httpClient from '../../../utils/httpUtil';

jest.mock('../../../utils/httpUtil');

describe('server setting dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const serverSettings = useRecoilValue(ServerSettingsState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        serverSettings,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [{ recoilState: ServerSettingsState, initialValue: {} }],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          serverSettingsDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should set allowDataCollection to false', async () => {
    await act(async () => {
      await dispatcher.updateServerSettings({
        telemetry: {
          allowDataCollection: false,
        },
      });
    });

    expect(renderedComponent.current.serverSettings.telemetry.allowDataCollection).toBe(false);
    expect(httpClient.post).toBeCalledWith(
      '/settings',
      expect.objectContaining({
        settings: {
          telemetry: {
            allowDataCollection: false,
          },
        },
      })
    );
  });

  it('should set allowDataCollection to true', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({});

    await act(async () => {
      await dispatcher.updateServerSettings({
        telemetry: {
          allowDataCollection: true,
        },
      });
    });

    expect(renderedComponent.current.serverSettings.telemetry.allowDataCollection).toBe(true);
    expect(httpClient.post).toBeCalledWith(
      '/settings',
      expect.objectContaining({
        settings: {
          telemetry: {
            allowDataCollection: true,
          },
        },
      })
    );
  });

  it('should fetch settings from server', async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: {
        telemetry: {
          allowDataCollection: null,
        },
      },
    });

    await act(async () => {
      await dispatcher.fetchServerSettings();
    });

    expect(renderedComponent.current.serverSettings.telemetry.allowDataCollection).toBe(null);
  });
});
