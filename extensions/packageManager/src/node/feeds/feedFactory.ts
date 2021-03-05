// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';

import { IExtensionRegistration } from '@bfc/extension-client';
import axios from 'axios';

import { IFeed, IPackageSource, PackageSourceType } from './feedInterfaces';
import { NpmFeed } from './npm/npmFeed';
import { LocalNuGetFeed } from './nuget/localNuGetFeed';
import { NuGetFeed } from './nuget/nugetFeed';

/**
 * Builds the correct feed abstraction based on the provided package source information.
 */
export class FeedFactory {
  /**
   * Builds a feed factory.
   * @param composer The composer registration for logging.
   */
  constructor(private composer: IExtensionRegistration) {}

  /**
   * Builds the corresponding feed abstraction, based on the provided package source information.
   * @param packageSource Package source information based on which the factory will select the feed to be built.
   */
  async build(packageSource: IPackageSource): Promise<IFeed> {
    this.composer.log(`Feed factory processing url ${packageSource.url}`);

    // If the url is a file system url, create LocalNuGetFeed
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    if (fs.existsSync(packageSource.url)) {
      return new LocalNuGetFeed(this.composer, packageSource.url);
    } else {
      // If we know the package source type, route to the right feed
      if (packageSource.type === PackageSourceType.NPM) {
        return new NpmFeed(this.composer, packageSource);
      } else if (packageSource.type === PackageSourceType.NuGet) {
        return new NuGetFeed(this.composer, packageSource);
      }

      // We don't know the source type, so we query the url and try to infer the source type and build
      // the right feed. Ideally we'd deprecate this path soon and ask for source type to users or condition
      // based on runtime type.
      const httpResponse = await axios.get(packageSource.url);
      const feed = httpResponse?.data;

      if (!feed) {
        this.composer.log(`Feed ${packageSource.url} not found.`);
        return null;
      }

      // NPM feed
      if (feed.objects) {
        return new NpmFeed(this.composer, undefined, feed);
      } else if (feed.data || feed.resources) {
        // NuGet search endpoint
        return new NuGetFeed(this.composer, undefined, feed);
      } else {
        this.composer.log(`Unknown feed format in url ${packageSource.url}`);
        return null;
      }
    }
  }
}
