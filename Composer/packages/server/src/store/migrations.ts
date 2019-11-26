// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

import get from 'lodash/get';
import set from 'lodash/set';

import log from '../logger';
import settings from '../settings';

interface Migration {
  /**
   * Migration label. Will be printed to the console in debug.
   * @example 'Update Designer to Composer'
   */
  name: string;
  /**
   * Use to check if a condition exists that requires migration.
   * @example data => data.name === 'Designer';
   */
  condition: (data: any) => boolean;
  /**
   * Data transform to run if condition is met.
   * @example data => ({ ...data, name: 'Composer' });
   */
  run: (data: any) => any;
}

const migrations: Migration[] = [
  {
    name: 'Add defaultPath',
    condition: data => get(data, 'storageConnections.0.defaultPath') !== settings.botsFolder,
    run: data => set(data, 'storageConnections[0].defaultPath', settings.botsFolder),
  },
];

export function runMigrations(initialData: any): any {
  const migrationsToRun: Migration[] = migrations.filter(m => m.condition(initialData));
  if (migrationsToRun.length > 0) {
    log('migration: running migrations...');

    const data = migrationsToRun.reduce((data, m, i) => {
      log('migration: %s (%d / %d)', m.name, i + 1, migrationsToRun.length);
      return m.run(data);
    }, initialData);

    log('migration: done!');

    return data;
  }

  return initialData;
}
