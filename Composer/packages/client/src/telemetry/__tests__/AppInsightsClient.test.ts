// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TelemetryEventTypes } from '@bfc/shared';

import httpClient from '../../utils/httpUtil';
import AppInsightsClient from '../AppInsightsClient';

describe('Application Insights Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log event to the server', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({});

    AppInsightsClient.setup({ allowDataCollection: true });
    AppInsightsClient.trackEvent('TestEvent', { value: '1' });
    AppInsightsClient.drain();

    expect(httpClient.post).toBeCalledWith(
      '/telemetry/events',
      expect.objectContaining({
        events: expect.arrayContaining([
          expect.objectContaining({
            type: TelemetryEventTypes.TrackEvent,
            name: 'TestEvent',
            properties: {
              value: '1',
            },
          }),
        ]),
      })
    );
  });

  it('should not log event to the server', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({});

    AppInsightsClient.setup({ allowDataCollection: false });
    AppInsightsClient.trackEvent('TestEvent', { value: '1' });
    AppInsightsClient.drain();

    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it('should log page views to the server', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({});

    AppInsightsClient.setup({ allowDataCollection: true });
    AppInsightsClient.logPageView('TestEvent', 'https://composer', { value: '1' });
    AppInsightsClient.drain();

    expect(httpClient.post).toBeCalledWith(
      '/telemetry/events',
      expect.objectContaining({
        events: expect.arrayContaining([
          expect.objectContaining({
            type: TelemetryEventTypes.PageView,
            url: 'https://composer',
            name: 'TestEvent',
            properties: {
              value: '1',
            },
          }),
        ]),
      })
    );
  });

  it('should not log page views to the server', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({});

    AppInsightsClient.setup({ allowDataCollection: false });
    AppInsightsClient.logPageView('TestEvent', 'https://composer', { value: '1' });
    AppInsightsClient.drain();

    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it('should drain event pool in batches', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({});
    AppInsightsClient.setup({ allowDataCollection: true });

    for (let i = 0; i < 42; i++) {
      AppInsightsClient.logPageView('TestEvent', 'https://composer', { value: '1' });
    }
    AppInsightsClient.drain();

    expect(httpClient.post).toHaveBeenCalledTimes(3);
  });
});
