// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import pickBy from 'lodash/pickBy';
import { TelemetryEventLogger, LogData, TelemetryEventName, TelemetryEvents } from '@botframework-composer/types';

import { addPropsToLogger, getLogger } from './telemetryLogger';

export const getEventLogger = (properties?: LogData | (() => LogData)): TelemetryEventLogger => {
  const logger = addPropsToLogger(getLogger(), properties);

  const log = <TN extends TelemetryEventName>(
    eventName: TN,
    ...args: TelemetryEvents[TN] extends undefined ? [never?] : [TelemetryEvents[TN]]
  ) => {
    const [properties] = args;
    logger.logEvent(eventName, pickBy(properties as any));
  };

  const pageView = <TN extends TelemetryEventName>(
    eventName: TN,
    url: string,
    ...args: TelemetryEvents[TN] extends undefined ? [never?] : [TelemetryEvents[TN]]
  ) => {
    const [properties] = args;
    logger.logPageView(eventName, url, pickBy(properties as any));
  };

  return {
    log,
    pageView,
    flush: logger.flush,
  };
};
