// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExtensionRegistration } from '@bfc/extension-client';
import { IFeed, IPackageSource, PackageSourceType } from './feedInterfaces';
import { NpmFeed } from './npm/npmFeed';
import { LocalNuGetFeed } from './nuget/localNuGetFeed';
import { NuGetFeed } from './nuget/nugetFeed';
import axios from 'axios';
import * as fs from 'fs';

export class FeedFactory {
  constructor(private composer: IExtensionRegistration) {}

  async build(packageSource: IPackageSource): Promise<IFeed> {
    this.composer.log(`Feed factory processing url ${packageSource.url}`);

    // If the url is a file system url, create LocalNuGetFeed
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
