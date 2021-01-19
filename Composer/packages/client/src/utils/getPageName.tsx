// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PageNames } from '@bfc/shared';

const PagesRegex = {
  [PageNames.Design]: /\/dialogs|\/bot\/d+.d+/i,
  [PageNames.Home]: /\/|\/home|\/projects\/create|\/projects\/open/i,
  [PageNames.LanguageGeneration]: /\/language-generation/i,
  [PageNames.LanguageUnderstanding]: /\/language-understanding/i,
  [PageNames.KnowledgeBase]: /\/knowledge-base/i,
  [PageNames.Publish]: /\/publish/i,
  [PageNames.Diagnostics]: /\/diagnostics/i,
  [PageNames.BotProjectsSettings]: /\/botProjectsSettings/i,
  [PageNames.Plugin]: /\/plugin/i,
  [PageNames.Settings]: /\/settings/i,

  // Extensions
  [PageNames.Forms]: /\/forms/i,
  [PageNames.PackageManger]: /\/package-manager/i,
};

export const getPageName = (pathname: string): PageNames => {
  for (const page of Object.values(PageNames) as PageNames[]) {
    if (PagesRegex[page]?.test(pathname)) {
      return page;
    }
  }

  return PageNames.Unknown;
};
