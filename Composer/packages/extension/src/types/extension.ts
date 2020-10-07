// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ExtensionContributionPage = {
  /** Id of cooresponding UI bundle. */
  bundleId: string;
  /** Label to dispaly in nav. */
  label: string;
  /** Optional icon to use in nav. Available icons [here](https://developer.microsoft.com/en-us/fluentui#/styles/web/icons). */
  icon?: string;
  // when?: string;
};

export type ExtensionContribution = {
  views?: {
    pages?: ExtensionContributionPage[];
    publish?: {
      bundleId?: string;
    };
  };
};

export type ExtensionBundle = {
  id: string;
  path: string;
};

export type ExtensionMetadata = {
  /** name field from package.json */
  id: string;
  /** name field from composer object in package.json, defaults to id */
  name: string;
  /** description field from package.json */
  description: string;
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
};

export interface ExtensionMap {
  [id: string]: ExtensionMetadata | undefined;
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
  composer?: {
    name?: string;
    enabled?: boolean;
    contributes?: ExtensionContribution;
    bundles?: ExtensionBundle[];
  };
}
