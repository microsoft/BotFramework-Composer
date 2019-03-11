import { config } from '../src/config';

test('test config value', () => {
  expect(config.bot.provider).toBe('localDisk');
});

test('test launcher type', () => {
  let type: string = config.launcherConnector.type;
  const typeOptions: string[] = ['CSharp', 'Nodejs'];
  expect(typeOptions.indexOf(type)).not.toBe(-1);
});
