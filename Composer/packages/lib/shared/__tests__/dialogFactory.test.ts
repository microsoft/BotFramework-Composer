import { seedDefaults, seedNewDialog } from '../src/dialogFactory';

describe('DialogFactory', () => {
  describe('#seedDefaults', () => {
    it('can assign defaults to non-object types', () => {
      const seed: any = seedDefaults('Microsoft.TextInput');
      expect(seed.maxTurnCount).toBe(3);
      expect(seed.alwaysPrompt).toBe(false);
    });

    it('can assign defaults to object types', () => {
      const seed: any = seedDefaults('Microsoft.ChoiceInput');
      expect(seed.choiceOptions.includeNumbers).toBe(true);
    });

    it("does not assign defaults when it shouldn't", () => {
      const seed: any = seedDefaults('Microsoft.SendActivity');
      expect(seed.activity).toBeFalsy();
    });
  });

  describe('#seedNewDialog', () => {
    it('does not override user-provided values', () => {
      const seed: any = seedNewDialog('Microsoft.TextInput', { name: 'My Name' }, { allowInterruptions: 'foo' });
      expect(seed.allowInterruptions).toEqual('foo');
    });

    it('does not override initial values', () => {
      const seed: any = seedNewDialog('Microsoft.TextInput', { name: 'My Name' });
      expect(seed.allowInterruptions).toEqual('false');
    });
  });
});
