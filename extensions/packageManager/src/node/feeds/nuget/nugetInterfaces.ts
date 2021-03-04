// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * NuGet Search result as defined in NuGet spec.
 * Docs: https://docs.microsoft.com/en-us/nuget/api/search-query-service-resource#response
 */
export interface INuGetSearchResult {
  totalHits: number;
  data: INuGetPackage[];
}

/**
 * NuGet package definition as defined in NuGet spec.
 * Docs: https://docs.microsoft.com/en-us/nuget/api/search-query-service-resource#search-result
 */
export interface INuGetPackage {
  id: string;
  description?: string;
  version: string;
  authors?: string | string[];
  versions: INuGetVersion[];
  tags?: string | string[];
  projectUrl?: string;
}

/**
 * NuGet service index definition as defined in NuGet spec.
 * Docs: https://docs.microsoft.com/en-us/nuget/api/service-index#sample-response
 */
export interface INuGetServiceIndex {
  /**
   * Available NuGet resources.
   */
  resources: INuGetResource[];

  /**
   * NuGet version.
   */
  version: string;
}

/**
 * NuGet version information as defined in NuGet spec.
 */
export interface INuGetVersion {
  '@id': string;
  version: string;
  downloads: string;
}

/**
 * A resource is an object in the resources array. It represents a versioned capability of a package source.
 * Spec: https://docs.microsoft.com/en-us/nuget/api/service-index
 */
export interface INuGetResource {
  /**
   * The URL to the resource.
   */
  '@id': string;

  /**
   * A string constant representing the resource type
   */
  '@type': string;

  /**
   * An optional comment describing the resource.
   */
  comment?: string;
}
