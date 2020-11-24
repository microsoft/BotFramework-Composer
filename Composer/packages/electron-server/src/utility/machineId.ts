// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import crypto from 'crypto';

import { v4 as uuid } from 'uuid';

import { getMacAddress } from './getMacAddress';

export async function getMachineId(): Promise<string> {
  return (await getMacMachineId()) || uuid.generateUuid(); // fallback, generate a UUID
}

async function getMacMachineId(): Promise<string | undefined> {
  try {
    const macAddress = await getMacAddress();
    return crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
  } catch (err) {
    return;
  }
}
