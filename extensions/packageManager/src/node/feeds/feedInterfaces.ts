// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Package definition agnostic to package source.
 */
export interface IPackageDefinition {
  name: string;
  version: string;
  versions: string[];
  authors: string;
  keywords: string;
  repository: string;
  description: string;
  language: string;
  source: string;
}

/**
 * Package query definition.
 */
export interface IPackageQuery {
  query?: string;
  prerelease?: boolean;
  semVerLevel?: string;
  skip?: number;
  take?: number;
}

// Package source definition.
export interface IPackageSource {
  key: string;
  text: string;
  url: string;
  searchUrl?: string;
  readonly?: boolean;
  defaultQuery?: IPackageQuery;
  type?: PackageSourceType.NuGet | PackageSourceType.NPM;
}

/**
 * Enumeration of supported package source protocols.
 */
export enum PackageSourceType {
  NuGet = 'nuget',
  NPM = 'npm',
}

/**
 * Defines a generic package feed.
 */
export interface IFeed {
  /**
   * Retrieves packages from the feed according to the query parameters provided.
   */
  getPackages: (query?: IPackageQuery) => Promise<IPackageDefinition[]>;
}
