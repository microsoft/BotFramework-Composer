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

export async function getMachineId(): Promise<string> {
  if (!existsSync(persistedFilePath)) {
    const hashedMac = await getMacMachineId();
    const machineId = hashedMac?.slice(0, hashedMac.length * 0.8) || uuid();
    const telemetrySettings = { machineId };

    writeJsonFileSync(persistedFilePath, telemetrySettings);
    return machineId;
  } else {
    const raw = readTextFileSync(persistedFilePath);
    return JSON.parse(raw).machineId;
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
