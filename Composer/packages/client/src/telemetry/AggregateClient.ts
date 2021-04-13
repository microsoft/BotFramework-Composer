// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const AggregateClient = (...loggers) => {
  const drain = () => {
    loggers.forEach((logger) => logger?.drain());
  };

  const logPageView = (eventName, url, properties) => {
    loggers.forEach((logger) => logger.logPageView(eventName, url, properties));
  };

  const trackEvent = (eventName, properties) => {
    loggers.forEach((logger) => logger.trackEvent(eventName, properties));
  };

  return {
    drain,
    logPageView,
    trackEvent,
  };
};
