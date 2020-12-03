// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgFile } from '@bfc/shared';

export const locateLgTemplatePosition = (
  lgFiles: LgFile[],
  lgTemplateName: string,
  locale: string
): LgFile | undefined => {
  const currentLocaleLgFiles = lgFiles.filter((f) => f.id.endsWith(locale));
  const relatedLgFile = currentLocaleLgFiles.find((file) =>
    file.templates.some((template) => template.name === lgTemplateName)
  );
  return relatedLgFile;
};
