// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TelemetryEventTypes } from '@bfc/shared';

import httpClient from '../../utils/httpUtil';
import { getApplicationInsightsLogger } from '../applicationInsightsLogger';

jest.mock('../../utils/httpUtil');

describe('Application Insights Logger', () => {
  it('should log event to the server', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({});

    const eventLogger = getApplicationInsightsLogger();
    eventLogger.logEvent('TestEvent', { value: '1' });
    eventLogger.flush();

    expect(httpClient.post).toBeCalledWith(
      '/telemetry/event',
      expect.objectContaining({
        type: TelemetryEventTypes.TrackEvent,
        name: 'TestEvent',
        properties: {
          value: '1',
        },
      })
    );
  });

  it('should log page views to the server', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({});

    const eventLogger = getApplicationInsightsLogger();
    eventLogger.logPageView('TestEvent', 'https://composer', { value: '1' });
    eventLogger.flush();

    expect(httpClient.post).toBeCalledWith(
      '/telemetry/event',
      expect.objectContaining({
        type: TelemetryEventTypes.PageView,
        name: 'TestEvent',
        url: 'https://composer',
        properties: {
          value: '1',
        },
      })
    );
  });
});
