// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData } from '../../../types/src';

export default class ConsoleClient {
  public static logEvent(name: string, properties: LogData) {
    console.log('bfc-telemetry', { name, properties });
  }

  public static logPageView(name: string, url: string, properties: LogData) {
    console.log('bfc-telemetry', { name, url, properties });
  }

  public static drain() {
    return;
  }
}
