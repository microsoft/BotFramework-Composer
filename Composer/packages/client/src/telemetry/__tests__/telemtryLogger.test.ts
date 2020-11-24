// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { addPropsToLogger } from '../telemetryLogger';

describe('addPropsToLogger', () => {
  it('adds property to logEvent', () => {
    const mockLogger = {
      logEvent: jest.fn(),
      logPageView: jest.fn(),
      flush: jest.fn(),
    };

    const logger = addPropsToLogger(mockLogger, { prop1: 'prop1' });
    logger.logEvent('Test', { prop0: 'prop0' });
    expect(mockLogger.logEvent).toBeCalledWith(
      'Test',
      expect.objectContaining({
        prop0: 'prop0',
        prop1: 'prop1',
      })
    );
  });

  it('adds property to logPageView', () => {
    const mockLogger = {
      logEvent: jest.fn(),
      logPageView: jest.fn(),
      flush: jest.fn(),
    };

    const logger = addPropsToLogger(mockLogger, { prop1: 'prop1' });
    logger.logPageView('Test', 'https://composer', { prop0: 'prop0' });
    expect(mockLogger.logPageView).toBeCalledWith(
      'Test',
      'https://composer',
      expect.objectContaining({
        prop0: 'prop0',
        prop1: 'prop1',
      })
    );
  });
});
