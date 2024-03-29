// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { LGResource, ImportResolverDelegate } from 'botbuilder-lg';

export declare type ResolverResource = { content: string; id: string };
export declare type LUImportResolverDelegate = (source: string, resourceId: string) => ResolverResource;

function getFileName(path: string): string {
  return path.split('/').pop() || path;
}

/**
 *
 * @param resources  resources feed to resolver
 * @param ext resource extension, e.g. .lg, .lu
 * @param defaultLocale   complete resource id = [id].[locale][ext]
 */
export function luImportResolverGenerator(
  resources: ResolverResource[],
  ext = '',
  defaultLocale = 'en-us',
): LUImportResolverDelegate {
  /**
   *  @param source current file id
   *  @param resourceId imported file id
   *  for example:
   *  in todosample.en-us.lg:
   *   [import](../common/common.lg)
   *
   *  would resolve to common.en-us.lg || common.lg
   *
   *  source =  todosample || todosample.en-us || todosample.en-us.lg || todosample.lg  || .
   *  resourceId =   common || common.lg || ../common/common.lg
   *
   */
  return (source: string, resourceId: string) => {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const extReg = new RegExp(ext + '$');
    const sourceId = getFileName(source).replace(extReg, '');
    const locale = /\w\.\w/.test(sourceId) ? sourceId.split('.').pop() : defaultLocale;
    const targetId = getFileName(resourceId).replace(extReg, '');

    const targetFile =
      resources.find(({ id }) => id === `${targetId}.${locale}`) || resources.find(({ id }) => id === targetId);

    if (!targetFile) throw new Error(formatMessage(`File not found`));
    return {
      id: targetFile.id,
      content: targetFile.content,
    };
  };
}

/**
 *
 * @param resources  resources feed to resolver
 * @param ext resource extension, e.g. .lg, .lu
 * @param defaultLocale   complete resource id = [id].[locale][ext]
 */
export function lgImportResolverGenerator(
  resources: ResolverResource[],
  ext = '',
  defaultLocale = 'en-us',
): ImportResolverDelegate {
  /**
   *  @param source current file id
   *  @param resourceId imported file id
   *  for example:
   *  in todosample.en-us.lg:
   *   [import](../common/common.lg)
   *
   *  would resolve to common.en-us.lg || common.lg
   *
   *  lgResource =  todosample || todosample.en-us || todosample.en-us.lg || todosample.lg  || .
   *  resourceId =   common || common.lg || ../common/common.lg
   *
   */
  return (lgResource: LGResource, resourceId: string) => {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const extReg = new RegExp(ext + '$');
    const sourceId = getFileName(lgResource.id).replace(extReg, '');
    const locale = /\w\.\w/.test(sourceId) ? sourceId.split('.').pop() : defaultLocale;
    const targetId = getFileName(resourceId).replace(extReg, '');

    const targetFile =
      resources.find(({ id }) => id === `${targetId}.${locale}`) || resources.find(({ id }) => id === targetId);

    if (!targetFile) throw new Error(formatMessage(`File not found`));
    return new LGResource(targetFile.id, targetFile.id, targetFile.content);
  };
}
