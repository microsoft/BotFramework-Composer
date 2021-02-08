// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface AzureResourceRetrieverConfig {
    // The credentials of user
    creds: any;

    // The logger
    logger: any;

    // The subscription id of user
    subscriptionId: string;
}