import { startServer, stopServer, getStatus } from '../src/handlers/launcherHandler';
import { LauncherStatus } from '../src/launcher-connectors/launcherStatus';

jest.mock('../src/storage/SettingService', () => {
  const mockSettings: any = {
    openLastActiveBot: 'true',
    launcherConnector: {
      type: 'CSharp',
      path: '../../../BotLauncher/CSharp',
    },
  };
  return { getItem: (key: string) => mockSettings[key] };
});

const mockKill = jest.fn(() => null);
const mockOn = jest.fn(() => null);
const mockSpawnSync = jest.fn(() => null);
const mockSpawn = jest.fn(() => ({
  kill: mockKill,
  on: mockOn,
  stdout: { on: mockOn },
  stderr: { on: mockOn },
}));
jest.mock('child_process', () => ({
  spawnSync: () => mockSpawnSync(),
  spawn: () => mockSpawn(),
}));

function statusToString(status: LauncherStatus): string {
  return LauncherStatus[status];
}

describe('launcherHandler', () => {
  beforeEach(() => {
    mockKill.mockClear();
    mockOn.mockClear();
    mockSpawnSync.mockClear();
    mockSpawn.mockClear();
  });

  it('should not throw an error on start', () => {
    expect(() => startServer()).not.toThrowError();
    expect(mockSpawn).toHaveBeenCalled();
    expect(mockSpawnSync).toHaveBeenCalled();
    expect(mockOn).toHaveBeenCalledTimes(3);
    expect(getStatus()).toBe(statusToString(LauncherStatus.Running));
  });

  it('should throw an error on start if already running', () => {
    expect(() => startServer()).toThrowError();
    expect(mockSpawn).not.toHaveBeenCalled();
    expect(mockSpawnSync).not.toHaveBeenCalled();
  });

  it('should not throw an error on stop', () => {
    expect(() => stopServer()).not.toThrowError();
    expect(mockKill).toHaveBeenCalledTimes(1);
    expect(getStatus()).toBe(statusToString(LauncherStatus.Stopped));
  });

  it('should thrown an error on stop if already stopped', () => {
    expect(() => stopServer()).toThrowError();
    expect(mockKill).not.toHaveBeenCalled();
  });
});
