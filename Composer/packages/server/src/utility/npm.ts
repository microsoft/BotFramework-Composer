// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { promisify } from 'util';

import { mkdir, remove } from 'fs-extra';
import fetch from 'node-fetch';
import tar from 'tar';
import { BotTemplateV2, ExtensionSearchResult } from '@botframework-composer/types';

import logger from '../logger';

const streamPipeline = promisify(require('stream').pipeline);

const log = logger.extend('extension-manager:npm');

export async function getNpmTemplates(): Promise<BotTemplateV2[]> {
  const publicNpmTemplatePackages = await search('', ['bot']);
  const templates: BotTemplateV2[] = publicNpmTemplatePackages.map((value) => {
    return {
      id: value.id,
      name: value.id,
      description: value.description,
      package: {
        packageName: value.id,
        packageSource: 'npm',
      },
    } as BotTemplateV2;
  });
  return templates;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function search(query = '', keywords = ['botframework-composer']): Promise<ExtensionSearchResult[]> {
  try {
    log('Searching for %s', query);
    const queryString = query.replace(' ', '+');
    const keyWordString = keywords.join('+');
    const res = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${queryString}+keywords:${keyWordString}&size=100&from=0&quality=0.65&popularity=0.98&maintenance=0.5`
    );
    const data = await res.json();

    log('Got %d result(s).', data.objects?.length ?? 0);

    return data.objects.map((result) => {
      const { name, version, description = '', keywords = [], links = {} } = result.package;

      return {
        id: name,
        version,
        description,
        keywords,
        url: links.npm ?? '',
      } as ExtensionSearchResult;
    });
  } catch (err) {
    log('%O', err);

    return [];
  }
}

export async function downloadPackage(name: string, versionOrTag: string, destination: string) {
  const dLog = log.extend(name);
  dLog('Starting download.');
  const res = await fetch(`https://registry.npmjs.org/${name}`);
  const metadata = await res.json();
  const targetVersion = metadata['dist-tags'][versionOrTag] ?? versionOrTag;

  dLog('Resolved version %s to %s', versionOrTag, targetVersion);

  const tarballUrl = metadata.versions[targetVersion]?.dist.tarball;

  if (!tarballUrl) {
    dLog('Unable to get tarball url.');
    throw new Error(`Could not find ${name}@${targetVersion} on npm.`);
  }

  dLog('Fetching tarball.');
  const tarball = (await fetch(tarballUrl)).body;
  // clean up previous version
  await remove(destination); // lgtm[js/path-injection]
  await mkdir(destination); // lgtm[js/path-injection]

  const extractor = tar.extract({
    strip: 1,
    C: destination,
    strict: true,
  });

  dLog('Extracting tarball.');
  await streamPipeline(tarball, extractor);
  dLog('Done downloading.');
}
