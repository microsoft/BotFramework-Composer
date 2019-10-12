import { seedDefaults } from '../src/dialogFactory';

describe('DialogFactory', () => {
  describe('#seedDefaults', () => {
    it('can assign defaults to non-object types', async () => {
      const seed: any = seedDefaults('Microsoft.TextInput');
      expect(seed.maxTurnCount).toBe(3);
      expect(seed.alwaysPrompt).toBe(false);
    });
    it('can assign defaults to object types', async () => {
      const seed: any = seedDefaults('Microsoft.ChoiceInput');
      expect(seed.choiceOptions.includeNumbers).toBe(true);
    });
    it("does not assign defaults when it shouldn't", async () => {
      const seed: any = seedDefaults('Microsoft.SendActivity');
      expect(seed.activity).toBeFalsy();
    });
  });
});
