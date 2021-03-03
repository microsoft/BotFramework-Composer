// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFeed, IPackageDefinition, IPackageQuery, IPackageSource } from '../feedInterfaces';
import { IExtensionRegistration } from '@bfc/extension-client';
import axios from 'axios';

/**
 * Npm feed implementation.
 * @todo this simple implementation only returns the result of the http call
 * to the npm search endpoint, in the common IPackageDefinition format. Eventually
 * this class should evolve towards NuGet feed where we query and access the feed entirely
 * from here.
 */
export class NpmFeed implements IFeed {
  private language: string = 'js';
  private source: string = 'npm';

  /**
   * Creates an npm feed.
   * @param packageSource package source from where to retrieve packages.
   * @param data data received in the `objects` field from the http call to the npm registry.
   */
  constructor(private composer: IExtensionRegistration, private packageSource?: IPackageSource, private data?) {}

  /**
   * Gets packages from the npm feed based on the provided query.
   * @param query query parameters to filter what packages are retrieved.
   * @todo Query parameters are being ignored. Next step is to honor the provided query parameters.
   * @todo Add semantics for caching and for bypassing cache.
   */
  async getPackages(query?: IPackageQuery): Promise<IPackageDefinition[]> {
    // Legacy: if data was provided, map to `IPackageDefinition` and return.
    // When the UI allows to select the feed type (npm vs NuGet), we can remove this path.
    if (this.data) {
      return this.asPackageDefinition(this.data);
    }

    // If we didn't receive data in the constructor, query the package source.
    if (!this.packageSource) {
      throw new Error('Package source or data should be provided');
    }

    const httpResponse = await axios.get(this.packageSource.url);
    const feed = httpResponse?.data;

    if (!feed) {
      this.composer.log(`Feed ${this.packageSource.url} not found.`);
      return null;
    }

    // Transform the npm result to package source agnostic format.
    return this.asPackageDefinition(feed);
  }

  /**
   * Maps NPM specific search result to the generic IPackageDefinition that is package source agnostic.
   * @param searchResult The search result received from npm.
   */
  private asPackageDefinition(searchResult): IPackageDefinition[] {
    return searchResult.objects?.map((i) => {
      return {
        name: i.package.name,
        version: i.package.version,
        authors: i.package?.author?.name,
        keywords: i.package.keywords,
        repository: i.package?.links.repository,
        description: i.package.description,
        language: this.language,
        source: this.source,
      };
    });
  }
}
