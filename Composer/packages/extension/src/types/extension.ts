// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ExtensionContribution = {
  views?: {
    page?: {
      id: string;
      name: string;
      icon?: string;
      when?: string;
    }[];
    publish?: {
      bundleId?: string;
    };
  };
};

export type ExtensionBundle = {
  id: string;
  path: string;
};

export interface ExtensionMetadata {
  /** name field from package.json */
  id: string;
  /** name field from composer object in package.json, defaults to id */
  name: string;
  /** currently installed version */
  version: string;
  /** enabled or disabled */
  enabled: boolean;
  /** path to where module is installed */
  path: string;
  /** Special property only used in the in-memory representation of plugins to flag as a built-in. Not written to disk. */
  builtIn?: boolean;
  bundles: ExtensionBundle[];
  contributes: ExtensionContribution;
}

export interface ExtensionMap {
  [id: string]: ExtensionMetadata;
}

/** Info about a plugin returned from an NPM search query */
export interface ExtensionSearchResult {
  id: string;
  keywords: string[];
  version: string;
  description: string;
  url: string;
}

/** Representation of the properties Composer cares about inside of an extension's package.json */
export interface PackageJSON {
  name: string;
  version: string;
  description: string;
  extendsComposer: boolean;
  composer?: {
    name?: string;
    contributes?: ExtensionContribution;
    bundles?: ExtensionBundle[];
  };
}
