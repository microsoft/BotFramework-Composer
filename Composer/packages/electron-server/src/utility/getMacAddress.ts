// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { networkInterfaces } from 'os';

const invalidMacAddresses = new Set(['00:00:00:00:00:00', 'ff:ff:ff:ff:ff:ff', 'ac:de:48:00:11:22']);

function validateMacAddress(candidate: string): boolean {
  const tempCandidate = candidate.replace(/-/g, ':').toLowerCase();
  return !invalidMacAddresses.has(tempCandidate);
}

export function getMacAddress(): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject('Timeout: Unable to retrieve mac address'), 10000);
    getMac()
      .then((macAddress) => {
        resolve(macAddress);
        clearTimeout(timeout);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        clearTimeout(timeout);
      });
  });
}

export function getMac(): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const interfaces = networkInterfaces();
      for (const [, infos] of Object.entries(interfaces)) {
        for (const { mac } of infos) {
          if (validateMacAddress(mac)) {
            return resolve(mac);
          }
        }
      }

      reject('Format: Unable to retrieve mac address');
    } catch (err) {
      reject(err);
    }
  });
}
