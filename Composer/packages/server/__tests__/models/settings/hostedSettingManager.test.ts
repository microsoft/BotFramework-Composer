import { HostedSettingManager } from '../../../src/models/settings/hostedSettingManager';
import { Path } from '../../../src/utility/path';

const dir = './mocks';
const defaultDir = Path.join(__dirname, dir);

describe('get', () => {
  it('throws with invalid slot name', async () => {
    const sm = new HostedSettingManager(defaultDir);
    let threw = false;
    try {
      await sm.get('bad', true);
    } catch (x) {
      threw = true;
    }

    expect(threw).toBeTruthy();
  });
});
