import { isLgActivity, copyLgTemplate } from '../../../src/store/action/lgHandlers';

describe('lgUtils', () => {
  describe('#isLgActivity', () => {
    it('can handle empty input', () => {
      expect(isLgActivity('')).toBeFalsy();
    });

    it('can identify correct templates', () => {
      expect(isLgActivity('[bfdactivity-1234]')).toBeTruthy();
      expect(isLgActivity('[bfdprompt-1234]')).toBeTruthy();
      expect(isLgActivity('[bfdinvalidPrompt-1234]')).toBeTruthy();
      expect(isLgActivity('[bfdunrecognizedPrompt-1234]')).toBeTruthy();
    });

    it('can identify invalid templates', () => {
      expect(isLgActivity('any string')).toBeFalsy();

      expect(isLgActivity('bfdactivity-1234')).toBeFalsy();
      expect(isLgActivity('[bfdactivity-1234')).toBeFalsy();
      expect(isLgActivity('bfdactivity-1234')).toBeFalsy();
      expect(isLgActivity('[bfdactivity-abc]')).toBeFalsy();

      expect(isLgActivity('[abfdactivity-1234]')).toBeFalsy();
      expect(isLgActivity('[abfdactivity]')).toBeFalsy();
      expect(isLgActivity('[bfdactivity-]')).toBeFalsy();
    });
  });

  describe('#copyLgActivity', () => {
    const lgApi = {
      getLgTemplates: (id, activity) => Promise.resolve([{ Name: 'bfdactivity-1234', Body: 'Hello' }]),
      updateLgTemplate: (id, newId, newContent) => Promise.resolve(true),
    };

    it('can skip invalid input params', async () => {
      expect(await copyLgTemplate('common', '', 'newId', lgApi)).toEqual('');
      expect(await copyLgTemplate('common', 'wrong', 'newId', lgApi)).toEqual('wrong');
      expect(await copyLgTemplate('common', 'wrong', 'newId', null as any)).toEqual('wrong');
    });

    it('can copy existing template to a new template', async () => {
      expect(await copyLgTemplate('common', '[bfdactivity-1234]', '[bfdactivity-5678]', lgApi)).toEqual(
        '[bfdactivity-5678]'
      );
    });

    it('can handle non-existing template', async () => {
      expect(await copyLgTemplate('common', '[bfdactivity-4321]', '[bfdactivity-5678]', lgApi)).toEqual(
        '[bfdactivity-4321]'
      );
    });

    it('can recover from API error', async () => {
      // getLgTemplates error
      expect(
        await copyLgTemplate('common', '[bfdactivity-1234]', 'bfdactivity-5678', {
          ...lgApi,
          getLgTemplates: () => Promise.reject(),
        })
      ).toEqual('[bfdactivity-1234]');

      expect(
        await copyLgTemplate('common', '[bfdactivity-1234]', 'bfdactivity-5678', {
          ...lgApi,
          updateLgTemplate: () => Promise.reject(),
        })
      ).toEqual('Hello');
    });
  });
});
