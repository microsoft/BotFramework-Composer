// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RequestHandler } from 'express-serve-static-core';
import { JSONSchema7 } from 'json-schema';

import { PublishPlugin } from './publish';
import { RuntimeTemplate, BotTemplate } from './runtime';

export type ExtensionPublishContribution = {
  bundleId: string;
};

export type ExtensionPageContribution = {
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
    pages?: ExtensionPageContribution[];
    publish?: ExtensionPublishContribution[];
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

export type ExtensionMap = {
  [id: string]: ExtensionMetadata | undefined;
};

/** Info about a plugin returned from an NPM search query */
export type ExtensionSearchResult = {
  id: string;
  keywords: string[];
  version: string;
  description: string;
  url: string;
};

/** Representation of the properties Composer cares about inside of an extension's package.json */
export type PackageJSON = {
  name: string;
  version: string;
  description: string;
  composer?: {
    name?: string;
    enabled?: boolean;
    contributes?: ExtensionContribution;
    bundles?: ExtensionBundle[];
  };
};

export type ExtensionCollection = {
  storage: {
    [key: string]: any;
  };
  publish: {
    [key: string]: {
      plugin: {
        name: string;
        description: string;
        /** (Optional instructions displayed in the UI) */
        instructions?: string;
        /** (Optional) Schema for publishing configuration. */
        schema?: JSONSchema7;
        /** Whether or not the plugin has custom UI to host in the publish surface */
        bundleId?: string;
      };
      methods: PublishPlugin;
    };
  };
  authentication: {
    middleware?: RequestHandler;
    serializeUser?: (user: any, next: any) => void;
    deserializeUser?: (user: any, next: any) => void;
    allowedUrls: string[];
    [key: string]: any;
  };
  runtimeTemplates: RuntimeTemplate[];
  botTemplates: BotTemplate[];
  baseTemplates: BotTemplate[];
};
