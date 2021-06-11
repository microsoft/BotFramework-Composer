// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: It would be nice to use the regular expression matching.
// It would be nice to ignore the lib folders rather than listing them one at a time.
// However, as of 4/2021 it doesn't seem to work.
// We have the added complexity that packages/lib contains folders we DO want to process.
//
// /packages\/(?!lib$).+\/lib(\/.*)*/
// This was the negative lookahead regex I tried, but bable never seemed to honor.
// I verified this regex had the right behavior in a regex tester with many path variations.
module.exports = {
  presets: ['@babel/react', ['@babel/typescript', { allowNamespaces: true }]],
  plugins: ['@babel/plugin-proposal-class-properties'],
  ignore: [
    'packages/**/__tests__',
    'packages/**/build',
    'packages/**/node_modules',
    'packages/adaptive-flow/**/lib',
    'packages/adaptive-form/**/lib',
    'packages/client/public',
    'packages/electron-server',
    'packages/extension/**/lib',
    'packages/extension-client/**/lib',
    'packages/form-dialogs/**/lib',
    'packages/intellisense/**/lib',
    'packages/lib/**/lib',
    'packages/server-workers/**/lib',
    'packages/test-utils/**/lib',
    'packages/tools/**/lib',
    'packages/types/**/lib',
    'packages/ui-plugins/**/lib',
    '../extensions/**/node_modules',
    '../extensions/**/__tests__',
  ],
};
