// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, TelemetryLogger } from '@bfc/shared';
import noop from 'lodash/noop';

export const consoleLogger = (): TelemetryLogger => {
  const logEvent = (name: string, properties?: LogData) => {
    console.log('bfc-telemetry:', { name, properties });
  };

  const logPageView = (name: string, url: string, properties?: LogData) => {
    console.log('bfc-telemetry:', { name, url, properties });
  };

  return {
    logEvent,
    logPageView,
    flush: noop,
  };
};

export const getConsoleLogger = () => {
  return consoleLogger();
};
