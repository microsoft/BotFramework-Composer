// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExtensionRegistration } from '@bfc/extension-client';
import { IFeed, IPackageQuery, IPackageDefinition, IPackageSource } from '../feedInterfaces';
import { INuGetSearchResult, INuGetServiceIndex } from './nugetInterfaces';
import axios from 'axios';
import * as semverSort from 'semver-sort';

/**
 * NuGet v3 feed.
 */
export class NuGetFeed implements IFeed {
  private language: string = 'c#';
  private source: string = 'nuget';

  /**
   * Creates a NuGet v3 feed
   * @param composer Composer registration for logging.
   * @param packageSource Package source that represents the target NuGet source.
   * @param data Optional, legacy data parameter for cases in which we already have the nuget result.
   */
  constructor(
    private composer: IExtensionRegistration,
    private packageSource?: IPackageSource,
    private data?: INuGetSearchResult | INuGetServiceIndex
  ) {}

  /**
   * Gets packages from the NuGet feed using the package source default query, or if provided, the query parameter.
   * @param query Optional query parameter to be used when searching the NuGet feed. If not provied, we use the default source query.
   */
  async getPackages(query?: IPackageQuery): Promise<IPackageDefinition[]> {
    // Legacy: If seed data was provided on construction, use that instead of calling the api
    if (this.data) {
      // Is the seed data a search result? Note that ideally we want to remove this codepath since we cannot
      // do paging or other more advanced operations. Since this path is very inflexible, also
      // ignores the query provided in the package query.
      // Example url that ends up in this path: https://azuresearch-usnc.nuget.org/query?q=Tags:%22bf-component%22&prerelease=true
      const searchResult = this.data as INuGetSearchResult;
      if (searchResult.data) {
        return this.asPackageDefinition(searchResult);
      }
    }

    // Query package source url
    // Example url that ends in this path: https://www.myget.org/F/ms-test-adapters/api/v3/index.json
    let serviceIndex: INuGetServiceIndex = this.data as INuGetServiceIndex;

    // If we don't have a service index provided at construction, get it from the url
    if (!serviceIndex || !serviceIndex.resources) {
      const httpResponse = await axios.get(this.packageSource.url);
      serviceIndex = httpResponse?.data;
    }

    // Now that we have a service index either from seed data or from querying the NuGet feed,
    // we get the query endpoint, build query parameters, call feed api and return query results to caller
    const queryEndpoint = serviceIndex?.resources?.find((resource) => resource['@type'] === 'SearchQueryService');
    if (queryEndpoint) {
      const nuGetSearchUrl = this.buildNuGetSearchUrl(queryEndpoint['@id'], query);

      this.composer.log(`Retrieving NuGet packages with computed search url ${nuGetSearchUrl}`);
      const httpResponse = await axios.get(nuGetSearchUrl);

      if (httpResponse?.data == null) {
        this.composer.log(`Failed to get search service from url ${nuGetSearchUrl}`);
        return [];
      }

      const searchResult = httpResponse.data as INuGetSearchResult;
      if (searchResult.data) {
        return this.asPackageDefinition(searchResult);
      }
    } else {
      this.composer.log(`NuGet index returned no query endpoints`);
      return [];
    }
  }

  /**
   * Maps NuGet specific search result to the generic IPackageDefinition that is package source agnostic.
   * @param searchResult The search result received from nuget.
   */
  private asPackageDefinition(searchResult: INuGetSearchResult): IPackageDefinition[] {
    return searchResult.data.map((i) => {
      return <IPackageDefinition>{
        name: i.id,
        version: i.version,
        versions: i.versions ? semverSort.desc(i.versions.map((v) => v.version)) : [i.version],
        authors: i.authors[0],
        keywords: i.tags,
        repository: i.projectUrl,
        description: i.description,
        language: this.language,
        source: this.source,
      };
    });
  }

  /**
   * Build NuGet search url based on the NuGet search spec.
   * Spec: https://docs.microsoft.com/en-us/nuget/api/search-query-service-resource#search-for-packages
   * @param baseUrl The NuGet search service url.
   * @param query The desired query parameters. Note that if a package source provides a query, that query will be prioritized.
   * @todo Eventually que parameter query should augment the package query to support paging and further filtering. So the effective query will be a combination of the
   * package query plus the specified query parameters.
   */
  private buildNuGetSearchUrl(baseUrl: string, query?: IPackageQuery): string {
    let url: string = `${baseUrl}?prerelease=${query?.prerelease ?? true}&semVerLevel=${query?.semVerLevel ?? '2.0.0'}`;

    if (query?.query) {
      url = `${url}&q=${query.query}`;
    }

    if (query?.take) {
      url = `${url}&take=${query.take}`;
    }

    if (query?.skip) {
      url = `${url}&skip=${query.skip}`;
    }

    return url;
  }
}
