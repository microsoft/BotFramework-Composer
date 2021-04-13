// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultFilePath, parseFileName } from '../../../models/bot/botStructure';

const botName = 'Mybot';
const defaultLocale = 'en-us';

describe('Bot structure file path', () => {
  // cross-train config
  it('should get entry cross-train config file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'cross-train.config.json', {});
    expect(targetPath).toEqual('settings/cross-train.config.json');
  });

  // recognizer
  it('should get entry recognizer file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'test.lu.qna.dialog', {});
    expect(targetPath).toEqual('dialogs/test/recognizers/test.lu.qna.dialog');
  });

  // entry dialog
  it('should get entry <botName>.dialog file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'mybot.dialog', {});
    expect(targetPath).toEqual('mybot.dialog');
  });

  // common.lg
  it('should get common.lg file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'common.en-us.lg', {});
    expect(targetPath).toEqual('language-generation/en-us/common.en-us.lg');
  });

  // common.zh-cn.lg
  it('should get common.<locale>.lg file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'common.zh-cn.lg', {});
    expect(targetPath).toEqual('language-generation/zh-cn/common.zh-cn.lg');
  });

  // skill manifest
  it('should get exported skill manifest file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'EchoBot-4-2-1-preview-1-manifest.json', {});
    expect(targetPath).toEqual('manifests/EchoBot-4-2-1-preview-1-manifest.json');
  });

  // mybot.en-us.lg
  it('should get entry dialog.lg file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'mybot.en-us.lg', {});
    expect(targetPath).toEqual('language-generation/en-us/mybot.en-us.lg');
  });

  // mybot.zh-cn.lg
  it('should get entry dialog.lg file path', async () => {
    const targetPath = defaultFilePath('my-bot', defaultLocale, 'my-bot.zh-cn.lg', {});
    expect(targetPath).toEqual('language-generation/zh-cn/my-bot.zh-cn.lg');
  });

  // entry dialog's lu
  it('should get entry dialog.lu file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'mybot.en-us.lu', {});
    expect(targetPath).toEqual('language-understanding/en-us/mybot.en-us.lu');
  });

  // child dialog's entry
  it('should get child dialog file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'greeting.dialog', {});
    expect(targetPath).toEqual('dialogs/greeting/greeting.dialog');
  });

  // entry dialog's qna
  it('should get entry dialog.qna file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'mybot.en-us.qna', {});
    expect(targetPath).toEqual('knowledge-base/en-us/mybot.en-us.qna');
  });

  // shared source qna
  it('should get shared <name>.source.qna file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'myimport1.source.en-us.qna', {});
    expect(targetPath).toEqual('knowledge-base/source/myimport1.source.en-us.qna');
  });

  // child dialog's lg
  it('should get child dialog-lg file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'greeting.en-us.lg', {});
    expect(targetPath).toEqual('dialogs/greeting/language-generation/en-us/greeting.en-us.lg');
  });

  // child dialog's lu
  it('should get child dialog-lu file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'greeting.en-us.lu', {});
    expect(targetPath).toEqual('dialogs/greeting/language-understanding/en-us/greeting.en-us.lu');
  });

  // child dialog's qna
  it('should get child dialog-qna file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'greeting.en-us.qna', {});
    expect(targetPath).toEqual('dialogs/greeting/knowledge-base/en-us/greeting.en-us.qna');
  });

  // customized endpoint
  it('should get child dialog.source.qna file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'myimport1.qna', { endpoint: 'dialogs/Welcome' });
    expect(targetPath).toEqual('dialogs/Welcome/knowledge-base/en-us/myimport1.en-us.qna');
  });
});

describe('Parse file name', () => {
  // entry dialog
  it('should parse entry dialog file name', async () => {
    const { fileId, locale, fileType } = parseFileName('mybot.dialog', defaultLocale);
    expect(fileId).toEqual('mybot');
    expect(locale).toEqual(defaultLocale);
    expect(fileType).toEqual('.dialog');
  });

  // entry dialog's lg
  it('should parse entry dialog.lg file name', async () => {
    const { fileId, locale, fileType } = parseFileName('mybot.en-us.lg', defaultLocale);
    expect(fileId).toEqual('mybot');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.lg');
  });

  // entry dialog's lu
  it('should parse entry dialog.lu file name', async () => {
    const { fileId, locale, fileType } = parseFileName('mybot.en-us.lu', defaultLocale);
    expect(fileId).toEqual('mybot');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.lu');
  });

  // entry dialog's qna
  it('should parse entry dialog.qna file name', async () => {
    const { fileId, locale, fileType } = parseFileName('mybot.en-us.qna', defaultLocale);
    expect(fileId).toEqual('mybot');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.qna');
  });

  // all shared source qna
  it('should parse <name>.source.qna file name', async () => {
    const { fileId, fileType } = parseFileName('kb.source.en-us.qna', defaultLocale);
    expect(fileId).toEqual('kb');
    expect(fileType).toEqual('.source.en-us.qna');
  });

  // child dialog
  it('should parse child dialog file name', async () => {
    const { fileId, locale, fileType } = parseFileName('greeting.dialog', defaultLocale);
    expect(fileId).toEqual('greeting');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.dialog');
  });

  // child dialog's lg
  it('should parse child dialog.lg file name', async () => {
    const { fileId, locale, fileType } = parseFileName('greeting.zh-cn.lg', defaultLocale);
    expect(fileId).toEqual('greeting');
    expect(locale).toEqual('zh-cn');
    expect(fileType).toEqual('.lg');
  });

  // child dialog's lu
  it('should parse child dialog.lu file name', async () => {
    const { fileId, locale, fileType } = parseFileName('greeting.en-us.lu', defaultLocale);
    expect(fileId).toEqual('greeting');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.lu');
  });

  // child dialog's qna
  it('should parse child dialog.qna file name', async () => {
    const { fileId, locale, fileType } = parseFileName('greeting.en-us.qna', defaultLocale);
    expect(fileId).toEqual('greeting');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.qna');
  });
});
