// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultFilePath, parseFileName } from '../../../src/models/bot/botStructure';

const botName = 'Mybot';
const defaultLocale = 'en-us';

describe('Bot structure file path', () => {
  // entry dialog
  it('should get entry dialog file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'mybot.dialog');
    expect(targetPath).toEqual('mybot.dialog');
  });

  // common.lg
  it('should get common lg file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'common.en-us.lg');
    expect(targetPath).toEqual('language-generation/en-us/common.en-us.lg');
  });

  // common.zh-cn.lg
  it('should get common lg file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'common.zh-cn.lg');
    expect(targetPath).toEqual('language-generation/zh-cn/common.zh-cn.lg');
  });

  // skill manifest
  it('should get exported skill manifest file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'EchoBot-4-2-1-preview-1-manifest.json');
    expect(targetPath).toEqual('manifests/EchoBot-4-2-1-preview-1-manifest.json');
  });

  // mybot.en-us.lg
  it('should get entry dialog-lg file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'mybot.en-us.lg');
    expect(targetPath).toEqual('language-generation/en-us/mybot.en-us.lg');
  });

  // mybot.zh-cn.lg
  it('should get entry dialog-lg file path', async () => {
    const targetPath = defaultFilePath('my-bot', defaultLocale, 'my-bot.zh-cn.lg');
    expect(targetPath).toEqual('language-generation/zh-cn/my-bot.zh-cn.lg');
  });

  // entry dialog's lu
  it('should get entry dialog-lu file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'mybot.en-us.lu');
    expect(targetPath).toEqual('language-understanding/en-us/mybot.en-us.lu');
  });

  // child dialog's entry
  it('should get child dialog file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'greeting.dialog');
    expect(targetPath).toEqual('dialogs/greeting/greeting.dialog');
  });

  // child dialog's lg
  it('should get child dialog-lg file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'greeting.en-us.lg');
    expect(targetPath).toEqual('dialogs/greeting/language-generation/en-us/greeting.en-us.lg');
  });

  // child dialog's lu
  it('should get child dialog-lu file path', async () => {
    const targetPath = defaultFilePath(botName, defaultLocale, 'greeting.en-us.lu');
    expect(targetPath).toEqual('dialogs/greeting/language-understanding/en-us/greeting.en-us.lu');
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
  it('should parse entry dialog-lg file name', async () => {
    const { fileId, locale, fileType } = parseFileName('mybot.en-us.lg', defaultLocale);
    expect(fileId).toEqual('mybot');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.lg');
  });

  // entry dialog's lu
  it('should parse entry dialog-lu file name', async () => {
    const { fileId, locale, fileType } = parseFileName('mybot.en-us.lu', defaultLocale);
    expect(fileId).toEqual('mybot');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.lu');
  });

  // child dialog
  it('should parse child dialog file name', async () => {
    const { fileId, locale, fileType } = parseFileName('greeting.dialog', defaultLocale);
    expect(fileId).toEqual('greeting');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.dialog');
  });

  // child dialog's lg
  it('should parse entry dialog-lg file name', async () => {
    const { fileId, locale, fileType } = parseFileName('greeting.zh-cn.lg', defaultLocale);
    expect(fileId).toEqual('greeting');
    expect(locale).toEqual('zh-cn');
    expect(fileType).toEqual('.lg');
  });

  // child dialog's lu
  it('should parse entry dialog-lu file name', async () => {
    const { fileId, locale, fileType } = parseFileName('greeting.en-us.lu', defaultLocale);
    expect(fileId).toEqual('greeting');
    expect(locale).toEqual('en-us');
    expect(fileType).toEqual('.lu');
  });
});
