import { FileSettingManager } from '../../../src/models/settings/fileSettingManager';
import { Path } from '../../../src/utility/path';

const dir = './mocks';
const defaultDir = Path.join(__dirname, dir);

describe('get', () => {
  it('return values', async () => {
    const sm = new FileSettingManager(defaultDir);
    const result = await sm.get('', false);
    expect(result.label).toBe('default');
  });

  it('return obfuscated alues', async () => {
    const sm = new FileSettingManager(defaultDir);
    const result = await sm.get('', true);
    expect(result.label).toBe('*****');
    expect(result.mock1).toBe('*****');
    expect(result.mock2).toBe('*****');
    expect(result.mock3.mock3).toBe('*****');
    expect(result.mock3.mock4).toBe('*****');
    expect(result.mock3.mock5[0]).toBe('*****');
    expect(result.mock3.mock5[1]).toBe('*****');
  });

  it('return slot values', async () => {
    const sm = new FileSettingManager(defaultDir);
    const result = await sm.get('integration', false);
    expect(result.label).toBe('integration');
    const result2 = await sm.get('production', false);
    expect(result2.label).toBe('production');
    const result3 = await sm.get('bonus', false);
    expect(result3.label).toBe('bonus');
  });
});
