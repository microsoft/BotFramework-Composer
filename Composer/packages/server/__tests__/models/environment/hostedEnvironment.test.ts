import { absHostedConfig } from '../../../src/models/environment';
import { HostedEnvironment } from '../../../src/models/environment/hostedEnvironment';
import { Path } from '../../../src/utility/path';

const dir = './mocks';
const defaultDir = Path.join(__dirname, dir);

describe('getEnvironmentName', () => {
  it('return projectName', () => {
    const e = new HostedEnvironment({ ...absHostedConfig, basePath: defaultDir }, true);
    const result = e.getEnvironmentName('foo');
    expect(result).toBe('foo');
  });
});

describe('slots', () => {
  it('getDefaultSlot', () => {
    const e = new HostedEnvironment({ ...absHostedConfig, basePath: defaultDir }, true);
    const result = e.getDefaultSlot();
    expect(result).toBe('integration');
  });

  it('getSlotNames', () => {
    const e = new HostedEnvironment({ ...absHostedConfig, basePath: defaultDir }, true);
    const result = e.getSlotNames();
    expect(result.length).toBe(2);
    expect(result[0]).toBe('integration');
    expect(result[1]).toBe('production');
  });
});
