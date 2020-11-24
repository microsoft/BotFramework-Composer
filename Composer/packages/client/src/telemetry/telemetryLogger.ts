// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, TelemetryLogger, TelemetrySettings } from '@botframework-composer/types';
import noop from 'lodash/noop';

import { getApplicationInsightsLogger } from './applicationInsightsLogger';
import { getConsoleLogger } from './consoleLogger';
import { getEventLogger } from './getEventLogger';

export const getNoopLogger = (): TelemetryLogger => {
  return {
    logEvent: noop,
    logPageView: noop,
    flush: noop,
  };
};

// Event Logger Singleton
const theLogger = {
  current: getNoopLogger(),
};

export const createLogger = (telemetrySettings?: TelemetrySettings): TelemetryLogger => {
  return telemetrySettings?.allowDataCollection
    ? process.env.NODE_ENV !== 'development'
      ? getApplicationInsightsLogger()
      : getConsoleLogger()
    : getNoopLogger();
};

export const addPropsToLogger = (
  logger: TelemetryLogger,
  addProperties?: LogData | (() => LogData)
): TelemetryLogger => {
  const getProperties = typeof addProperties === 'function' ? addProperties : () => addProperties;

  const logEvent = (name: string, properties?: LogData) => {
    logger.logEvent(name, { ...getProperties(), ...properties });
  };

  const logPageView = (name: string, url: string, properties?: LogData) => {
    logger.logPageView(name, url, { ...getProperties(), ...properties });
  };

  return {
    ...logger,
    logPageView,
    logEvent,
  };
};

export const initializeLogger = (logger: TelemetryLogger, properties?: LogData | (() => LogData)) => {
  theLogger.current = addPropsToLogger(logger, properties);
  return getEventLogger();
};

export const getLogger = () => theLogger.current;
