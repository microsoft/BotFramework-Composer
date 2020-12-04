// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import TelemetryClient from '../TelemetryClient';
import AppInsightsClient from '../AppInsightsClient';

AppInsightsClient.logEvent = jest.fn();
AppInsightsClient.logPageView = jest.fn();

describe('TelemetryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds property to logEvent', () => {
    TelemetryClient.setup({ allowDataCollection: true }, { prop1: 'prop1' });
    TelemetryClient.log('ToolbarButtonClicked', { name: 'test' });

    expect(AppInsightsClient.logEvent).toBeCalledWith(
      'ToolbarButtonClicked',
      expect.objectContaining({
        prop1: 'prop1',
        name: 'test',
      })
    );
  });

  it('adds property to pageView', () => {
    TelemetryClient.setup({ allowDataCollection: true }, { prop1: 'prop1' });
    TelemetryClient.pageView('ToolbarButtonClicked', 'http://composer', { name: 'test' });

    expect(AppInsightsClient.logPageView).toBeCalledWith(
      'ToolbarButtonClicked',
      'http://composer',
      expect.objectContaining({
        prop1: 'prop1',
        name: 'test',
      })
    );
  });

  it('does not call AppInsightsClient.logEvent when allowDataCollection is false', () => {
    TelemetryClient.setup({ allowDataCollection: false }, { prop1: 'prop1' });
    TelemetryClient.log('ToolbarButtonClicked', { name: 'test' });

    expect(AppInsightsClient.logEvent).not.toHaveBeenCalled();
  });
});
