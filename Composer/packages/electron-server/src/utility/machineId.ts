// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import crypto from 'crypto';

import { v4 as uuid } from 'uuid';

import { getMacAddress } from './getMacAddress';

let machineId;
export async function getMachineId(): Promise<string> {
  if (!machineId) {
    machineId = (await getMacMachineId()) || uuid.generateUuid();
  }
  return machineId;
}

async function getMacMachineId(): Promise<string | undefined> {
  try {
    const macAddress = await getMacAddress();
    return crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
  } catch (err) {
    return;
  }
}
