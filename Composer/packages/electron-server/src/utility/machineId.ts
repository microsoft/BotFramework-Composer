// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';
import crypto from 'crypto';

import { app } from 'electron';
import { existsSync } from 'fs-extra';
import { v4 as uuid } from 'uuid';

import { getMacAddress } from './getMacAddress';
import { readTextFileSync, writeJsonFileSync } from './fs';

export const persistedFilePath = path.join(app.getPath('userData'), 'persisted.json');

function truncate(str: string): string {
  // We generate machine IDs using a hash of the MAC address, so
  // we truncate the hash to make it that much harder to reverse
  return str.slice(0, str.length * 0.8);
}

export async function getMachineId(): Promise<string> {
  if (!existsSync(persistedFilePath)) {
    const machineId = (await getMacMachineId()) || uuid();
    const telemetrySettings = { machineId };

    writeJsonFileSync(persistedFilePath, telemetrySettings);
    return truncate(machineId);
  } else {
    const raw = readTextFileSync(persistedFilePath);
    return truncate(JSON.parse(raw).machineId);
  }
}

async function getMacMachineId(): Promise<string | undefined> {
  try {
    const macAddress = await getMacAddress();
    return crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
  } catch (err) {
    return;
  }
}
