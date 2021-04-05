// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { networkInterfaces } from 'os';

import { getMac, getMacAddress } from '../../src/utility/getMacAddress';

jest.mock('os');

describe('getMac', () => {
  it('returns mac address', async () => {
    (networkInterfaces as jest.Mock).mockReturnValue({
      test: [
        {
          mac: '11:aa:22:bb:00:00',
        },
      ],
    });
    expect(getMac()).resolves.toEqual('11:aa:22:bb:00:00');
  });

  it('throws format error', async () => {
    (networkInterfaces as jest.Mock).mockReturnValue({});
    expect(getMac()).rejects.toEqual('Format: Unable to retrieve mac address');
  });
});

describe('getMacAddress', () => {
  it('returns mac address', async () => {
    (networkInterfaces as jest.Mock).mockReturnValue({
      test: [
        {
          mac: '11:aa:22:bb:00:00',
        },
      ],
    });
    expect(getMacAddress()).resolves.toEqual('11:aa:22:bb:00:00');
  });

  it('throws timeout error', async () => {
    try {
      jest.useFakeTimers();
      (networkInterfaces as jest.Mock).mockReturnValue({});

      const macAddress = getMacAddress();
      jest.advanceTimersToNextTimer(10001);
      expect(macAddress).rejects.toEqual('Timeout: Unable to retrieve mac address');
    } finally {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    }
  });
});
