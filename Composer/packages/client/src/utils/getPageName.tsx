// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PageNames } from '@bfc/shared';

const PagesRegex = {
  [PageNames.Design]: /\/dialogs/i,
  [PageNames.Home]: /\/home/i,
  [PageNames.LanguageGeneration]: /\/language-generation/i,
  [PageNames.LanguageUnderstanding]: /\/language-understanding/i,
  [PageNames.KnowledgeBase]: /\/knowledge-base/i,
  [PageNames.Publish]: /\/publish/i,
  [PageNames.Diagnostics]: /\/diagnostics/i,
  [PageNames.BotProjectsSettings]: /\/botProjectsSettings/i,
  [PageNames.Plugin]: /\/plugin/i,
  [PageNames.Settings]: /\/settings/i,
};

export const getPageName = (pathname: string): PageNames => {
  for (const page of Object.values(PageNames)) {
    if (PagesRegex[page as string]?.test(pathname)) {
      return page;
    }
  }

  return PageNames.Unknown;
};
