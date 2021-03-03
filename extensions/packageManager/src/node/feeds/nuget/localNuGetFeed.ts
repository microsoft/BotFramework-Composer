// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExtensionRegistration } from '@bfc/extension-client';
import { IFeed, IPackageQuery, IPackageDefinition } from '../feedInterfaces';
import { INuGetPackage } from './nugetInterfaces';
import { readdir, readFile } from 'fs-extra';
import { parseStringPromise } from 'xml2js';
import path from 'path';
import * as semverSort from 'semver-sort';

/**
 * NuGet feed in local file system.
 * @description Loads a NuGet package feed from the file system according to the NuGet documentation for local sources.
 * Docs: https://docs.microsoft.com/en-us/nuget/hosting-packages/local-feeds.
 */
export class LocalNuGetFeed implements IFeed {
  private language: string = 'c#';
  private source: string = 'nuget';

  /**
   * Creates a local NuGet feed.
   * @param composer Composer registration used for logging.
   * @param url Url of the feed, represented usually by the file path to the NuGet file system feed.
   */
  constructor(private composer: IExtensionRegistration, private url: string) {}

  /**
   * Gets packages from local NuGet feed according to query request.
   * @param query Query parameters.
   * @todo Query parameters currently ignored. Implement query in file system feed if needed.
   */
  async getPackages(query?: IPackageQuery): Promise<IPackageDefinition[]> {
    return await this.crawlLocalFeed(this.url);
  }

  /**
   * Crawls a local feed starting from the root directory.
   * @param url Root directory.
   */
  private async crawlLocalFeed(url: string): Promise<IPackageDefinition[]> {
    // The local feed is expected to be in folders using the structure defined here:
    // https://docs.microsoft.com/en-us/nuget/hosting-packages/local-feeds
    // the line below will:
    // * get a list of all the files at the specified url
    // * extract only folders from that list
    // * pass each one through the getPackageInfo function, which extracts metadata from the package
    // * return a feed in the form that is used by nuget search API
    const packages = await readdir(url, { withFileTypes: true });

    const feedPromises: Promise<IPackageDefinition>[] = packages
      .filter((f) => f.isDirectory())
      .map((f) => this.getPackageInfo(url, f.name));

    return await Promise.all(feedPromises);
  }

  /**
   * Given a root directory and a package name, obtain package information.
   * @param rootDir Root directory.
   * @param packageName Package name to be retrieved.
   */
  private async getPackageInfo(rootDir: string, packageName: string): Promise<IPackageDefinition> {
    // Available versions should be folders underneath this folder.
    const packageDir = path.join(rootDir, packageName);

    let versions;
    try {
      versions = await readdir(packageDir, { withFileTypes: true });
      versions = versions.filter((f) => f.isDirectory()).map((f) => f.name);
      if (versions.length === 0) {
        throw new Error('version list is empty');
      }
      versions = semverSort.desc(versions);
    } catch (err) {
      throw new Error(
        `Could not find versions of local package ${packageName} at ${rootDir}. For more info about setting up a local feed, see here: https://docs.microsoft.com/en-us/nuget/hosting-packages/local-feeds. Error: ${err}`
      );
    }

    // Read from the nuspec file in the latest to get other info.
    try {
      const pathToNuspec = path.join(packageDir, versions[0], `${packageName}.nuspec`);
      const xml = await readFile(pathToNuspec, 'utf8');
      const parsed = await parseStringPromise(xml);

      const nugetPackage: INuGetPackage = {
        id: parsed.package.metadata[0].id?.[0],
        version: parsed.package.metadata[0].version?.[0],
        authors: parsed.package.metadata[0].authors,
        projectUrl: parsed.package.metadata[0].projectUrl?.[0],
        description: parsed.package.metadata[0].description?.[0],
        tags: parsed.package.metadata[0].tags?.[0]?.split(/\s/),
        versions: versions.map((v) => {
          return { version: v };
        }),
      };

      return this.asPackageDefinition(nugetPackage);
    } catch (err) {
      this.composer.log(err);
      throw new Error(`Could not parse nuspec for local package ${packageName} at ${packageDir}`);
    }
  }

  /**
   * Format a NuGet package into a package agnostic package definition.
   * @param nugetPackage
   */
  private asPackageDefinition(nugetPackage: INuGetPackage): IPackageDefinition {
    return <IPackageDefinition>{
      name: nugetPackage.id,
      version: nugetPackage.version,
      versions: nugetPackage.versions
        ? semverSort.desc(nugetPackage.versions.map((v) => v.version))
        : [nugetPackage.version],
      authors: nugetPackage.authors[0],
      keywords: nugetPackage.tags,
      repository: nugetPackage.projectUrl,
      description: nugetPackage.description,
      language: this.language,
      source: this.source,
    };
  }
}
