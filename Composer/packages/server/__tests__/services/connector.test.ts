import BotConnectorService from '../../src/services/connector';
import { BotStatus } from '../../src/models/connector/interface';

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

describe('BotConnectorService', () => {
  beforeEach(() => {
    mockKill.mockClear();
    mockOn.mockClear();
    mockSpawnSync.mockClear();
    mockSpawn.mockClear();
  });

  it('should not throw an error on start', () => {
    expect(() => BotConnectorService.start()).not.toThrowError();
    expect(mockSpawn).toHaveBeenCalled();
    expect(mockSpawnSync).toHaveBeenCalled();
    expect(mockOn).toHaveBeenCalledTimes(3);
    expect(BotConnectorService.status()).toBe(BotStatus.Running);
  });

  it('should throw an error on start if already running', () => {
    expect(() => BotConnectorService.start()).toThrowError();
    expect(mockSpawn).not.toHaveBeenCalled();
    expect(mockSpawnSync).not.toHaveBeenCalled();
  });

  it('should not throw an error on stop', () => {
    expect(() => BotConnectorService.stop()).not.toThrowError();
    expect(mockKill).toHaveBeenCalledTimes(1);
    expect(BotConnectorService.status()).toBe(BotStatus.Stopped);
  });

  it('should thrown an error on stop if already stopped', () => {
    expect(() => BotConnectorService.stop()).toThrowError();
    expect(mockKill).not.toHaveBeenCalled();
  });
});
