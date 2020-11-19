// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileSettingManager } from '../../../models/settings/fileSettingManager';
import { Path } from '../../../utility/path';
import StorageService from '../../../services/storage';
import { LocalDiskStorage } from '../../storage/localDiskStorage';

jest.mock('../../../services/storage', () => ({
  getStorageClient: jest.fn(),
}));

const dir = './mocks';
const defaultDir = Path.join(__dirname, dir);

beforeEach(() => {
  (StorageService.getStorageClient as jest.Mock).mockReturnValue(new LocalDiskStorage());
});

describe('get', () => {
  it('return values', async () => {
    const sm = new FileSettingManager(defaultDir);
    const result = await sm.get(false);
    expect(result.label).toBe('default');
  });

  it('return obfuscated alues', async () => {
    const sm = new FileSettingManager(defaultDir);
    const result = await sm.get(true);
    expect(result.label).toBe('*****');
    expect(result.mock1).toBe('*****');
    expect(result.mock2).toBe('*****');
    expect(result.mock3.mock3).toBe('*****');
    expect(result.mock3.mock4).toBe('*****');
    expect(result.mock3.mock5[0]).toBe('*****');
    expect(result.mock3.mock5[1]).toBe('*****');
  });
});
